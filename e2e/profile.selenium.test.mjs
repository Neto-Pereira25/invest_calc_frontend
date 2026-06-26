import test from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder, By, until } = selenium;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
const TEST_PAUSE_MS = Number(process.env.SELENIUM_TEST_PAUSE_MS ?? 900);

async function createDriver() {
  const options = new chrome.Options();

  // options.addArguments("--headless=new");
  options.addArguments("--window-size=1366,1000");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function clearStorage(driver) {
  await driver.executeScript(`
    window.localStorage.clear();
    window.sessionStorage.clear();
  `);
}

async function sleep(driver, ms = TEST_PAUSE_MS) {
  await driver.sleep(ms);
}

async function getCurrentPath(driver) {
  const currentUrl = await driver.getCurrentUrl();
  return new URL(currentUrl).pathname;
}

async function waitForPath(driver, expectedPath) {
  await driver.wait(async () => {
    const path = await getCurrentPath(driver);
    return path === expectedPath;
  }, 10000, `Caminho esperado nao atingido: ${expectedPath}`);
}

async function getBodyText(driver) {
  return driver.executeScript("return document.body?.innerText ?? ''; ");
}

function normalizeText(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function waitForNormalizedText(driver, expectedText, timeout = 10000) {
  const normalizedExpected = normalizeText(expectedText);

  await driver.wait(async () => {
    const bodyText = await getBodyText(driver);
    return normalizeText(bodyText).includes(normalizedExpected);
  }, timeout, `Texto nao encontrado: ${expectedText}`);
}

async function findByTestId(driver, testId) {
  const selector = `[data-testid="${testId}"]`;
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    10000,
  );

  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(until.elementIsEnabled(element), 10000);

  return element;
}

async function clickByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);

  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    element,
  );

  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(until.elementIsEnabled(element), 10000);

  try {
    await element.click();
  } catch (error) {
    if (error.name !== "ElementClickInterceptedError") {
      throw error;
    }

    await driver.executeScript("arguments[0].click();", element);
  }

  await sleep(driver);
}

async function typeByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await sleep(driver);
}

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
}

function uniqueEmail() {
  return `perfil.helena.${Math.random().toString(36).slice(2, 6)}@email.com`;
}

async function registerUserByUi(driver, { name, email, password }) {
  await driver.get(`${FRONTEND_URL}/register`);

  await typeByTestId(driver, "register-name", name);
  await typeByTestId(driver, "register-email", email);
  await typeByTestId(driver, "register-password", password);
  await typeByTestId(driver, "register-confirm-password", password);

  await clickByTestId(driver, "register-submit");
  await waitForPath(driver, "/login");
  await sleep(driver);
}

async function loginAsNewUser(driver, { name, email, password }) {
  await driver.get(FRONTEND_URL);
  await clearStorage(driver);

  await registerUserByUi(driver, { name, email, password });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openProfilePage(driver) {
  await driver.get(`${FRONTEND_URL}/profile`);
  await waitForPath(driver, "/profile");
  await findByTestId(driver, "profile-page");
  await sleep(driver);
}

test("deve visualizar e atualizar dados do perfil do usuario", async () => {
  const driver = await createDriver();

  try {
    const originalName = "Helena Almeida";
    const updatedName = "Helena Costa";
    const email = uniqueEmail();
    const password = "12345678";

    await loginAsNewUser(driver, {
      name: originalName,
      email,
      password,
    });

    await openProfilePage(driver);

    assert.equal(await getTextByTestId(driver, "profile-card-name"), originalName);
    assert.equal(await getTextByTestId(driver, "profile-detail-name"), originalName);
    assert.equal(await getTextByTestId(driver, "profile-card-email"), email);
    assert.equal(await getTextByTestId(driver, "profile-detail-email"), email);
    assert.match(normalizeText(await getTextByTestId(driver, "profile-card-role")), /usuario/);
    assert.match(normalizeText(await getTextByTestId(driver, "profile-detail-role")), /usuario/);

    const userId = await getTextByTestId(driver, "profile-detail-id");
    assert.ok(userId.length > 0, "O campo de ID deve renderizar um valor ou o fallback da tela");

    await clickByTestId(driver, "profile-edit");
    await typeByTestId(driver, "profile-name-input", updatedName);
    await clickByTestId(driver, "profile-save");

    await waitForNormalizedText(driver, "Nome do usuário atualizado com sucesso");
    assert.equal(await getTextByTestId(driver, "profile-card-name"), updatedName);
    assert.equal(await getTextByTestId(driver, "profile-detail-name"), updatedName);
    assert.equal(await getTextByTestId(driver, "profile-detail-email"), email);

    await clickByTestId(driver, "profile-edit");
    await typeByTestId(driver, "profile-name-input", "Helena Temporaria");
    await clickByTestId(driver, "profile-cancel");

    assert.equal(await getTextByTestId(driver, "profile-card-name"), updatedName);
    assert.equal(await getTextByTestId(driver, "profile-detail-name"), updatedName);

    await clickByTestId(driver, "profile-edit");
    await typeByTestId(driver, "profile-name-input", "   ");
    await clickByTestId(driver, "profile-save");

    await waitForNormalizedText(driver, "Informe um nome válido para atualizar");
    assert.match(
      normalizeText(await getTextByTestId(driver, "profile-error")),
      /informe um nome valido para atualizar/,
    );
  } finally {
    await driver.quit();
  }
});
