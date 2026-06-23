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

async function clickElement(driver, element) {
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

async function clickByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  await clickElement(driver, element);
}

async function typeByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await sleep(driver);
}

async function clickRadioByTestId(driver, testId) {
  const element = await driver.wait(
    until.elementLocated(By.css(`[data-testid="${testId}"]`)),
    10000,
  );

  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    element,
  );
  await driver.executeScript("arguments[0].click();", element);
  await sleep(driver);
}

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
}

function uniqueEmail() {
  return `perfil.ana.${Math.random().toString(36).slice(2, 6)}@email.com`;
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

async function loginAsNewUser(driver) {
  await driver.get(FRONTEND_URL);
  await clearStorage(driver);

  const email = uniqueEmail();
  const password = "12345678";

  await registerUserByUi(driver, {
    name: "Ana Martins",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openFinancialProfilePage(driver) {
  await driver.get(`${FRONTEND_URL}/financial-profile`);
  await waitForPath(driver, "/financial-profile");
  await findByTestId(driver, "financial-profile-page");
  await sleep(driver);
}

async function answerQuestionnaire(driver, answers) {
  for (const [question, answer] of answers.entries()) {
    await clickRadioByTestId(driver, `financial-profile-q${question + 1}-${answer}`);
  }
}

test("deve calcular perfil financeiro investidor e exibir historico", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openFinancialProfilePage(driver);

    await findByTestId(driver, "financial-profile-empty-result");
    await findByTestId(driver, "financial-profile-empty-history");

    await clickByTestId(driver, "financial-profile-open-questionnaire");
    await findByTestId(driver, "financial-profile-form");

    await answerQuestionnaire(driver, ["E", "D", "D", "E", "E", "E", "E", "E", "E", "E"]);

    await clickByTestId(driver, "financial-profile-reset");
    const firstAnswer = await driver.findElement(By.css('[data-testid="financial-profile-q1-E"]'));
    assert.equal(await firstAnswer.isSelected(), false);

    await answerQuestionnaire(driver, ["E", "D", "D", "E", "E", "E", "E", "E", "E", "E"]);
    await clickByTestId(driver, "financial-profile-submit");

    await findByTestId(driver, "financial-profile-current-result");
    await waitForNormalizedText(driver, "perfil predominante", 20000);

    const profileText = await getTextByTestId(driver, "financial-profile-current-profile");
    assert.equal(profileText, "Investidor");

    const scoreRows = await driver.findElements(By.css('[data-testid="financial-profile-score-row"]'));
    assert.equal(scoreRows.length, 5);

    const historyItems = await driver.findElements(By.css('[data-testid="financial-profile-history-item"]'));
    assert.ok(historyItems.length >= 1);

    const recommendationsText = await getTextByTestId(driver, "financial-profile-recommendations");
    const suggestedGoalsText = await getTextByTestId(driver, "financial-profile-suggested-goals");

    assert.ok(recommendationsText.trim().length > 0);
    assert.ok(suggestedGoalsText.trim().length > 0);
  } finally {
    await driver.quit();
  }
});

test("deve manter questionario aberto ao tentar enviar sem respostas", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openFinancialProfilePage(driver);

    await clickByTestId(driver, "financial-profile-open-questionnaire");
    await findByTestId(driver, "financial-profile-form");
    await clickByTestId(driver, "financial-profile-submit");

    await findByTestId(driver, "financial-profile-form");

    const resultElements = await driver.findElements(By.css('[data-testid="financial-profile-current-result"]'));
    assert.equal(resultElements.length, 0);
  } finally {
    await driver.quit();
  }
});
