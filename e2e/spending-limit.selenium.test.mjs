import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder, By, until } = selenium;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
const TEST_PAUSE_MS = Number(process.env.SELENIUM_TEST_PAUSE_MS ?? 900);

let driver;

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

async function getBodyText(driver) {
  return driver.executeScript("return document.body?.innerText ?? '';");
}

async function waitForPath(driver, expectedPath) {
  await driver.wait(async () => {
    const path = await getCurrentPath(driver);
    return path === expectedPath;
  }, 10000);
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

async function typeByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await sleep(driver);
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

async function waitForOpenModalToClose(driver) {
  await driver.wait(async () => {
    const modals = await driver.findElements(By.css(".modal.show"));
    return modals.length === 0;
  }, 10000);
}

function uniqueShortSuffix() {
  return `${Date.now().toString().slice(-4)}${Math.random().toString(36).slice(2, 4)}`;
}

function uniqueEmail() {
  return `lg${uniqueShortSuffix()}@email.com`;
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
    name: "Lia Gomes",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openSpendingLimitPage(driver) {
  await driver.get(`${FRONTEND_URL}/spending-limit`);
  await waitForPath(driver, "/spending-limit");
  await sleep(driver);
}

describe("limite mensal de gastos", () => {
  before(async () => {
    driver = await createDriver();
    await loginAsNewUser(driver);
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test("cenario 5: deve validar valor zero ao criar limite", async () => {
    await openSpendingLimitPage(driver);
    await clickByTestId(driver, "spending-limit-create");

    await typeByTestId(driver, "spending-limit-amount", "0");
    await clickByTestId(driver, "spending-limit-submit");
    await waitForNormalizedText(driver, "O limite deve ser maior que zero");

    const modal = await findByTestId(driver, "spending-limit-modal");
    const modalText = await modal.getText();

    assert.match(modalText, /Definir Limite Mensal/);
    assert.match(modalText, /O limite deve ser maior que zero/);

    await clickByTestId(driver, "spending-limit-cancel");
    await waitForOpenModalToClose(driver);
    await findByTestId(driver, "spending-limit-empty");
  });

  test("cenario 6: deve validar valor negativo ao criar limite", async () => {
    await openSpendingLimitPage(driver);
    await clickByTestId(driver, "spending-limit-create");

    await typeByTestId(driver, "spending-limit-amount", "-100");
    await clickByTestId(driver, "spending-limit-submit");
    await waitForNormalizedText(driver, "O limite deve ser maior que zero");

    const modal = await findByTestId(driver, "spending-limit-modal");
    const amountInput = await findByTestId(driver, "spending-limit-amount");
    const modalText = await modal.getText();

    assert.equal(await amountInput.getAttribute("value"), "-100");
    assert.match(modalText, /Definir Limite Mensal/);
    assert.match(modalText, /O limite deve ser maior que zero/);

    await clickByTestId(driver, "spending-limit-cancel");
    await waitForOpenModalToClose(driver);
    await findByTestId(driver, "spending-limit-empty");
  });

  test("cenario 4: deve criar limite com sucesso", async () => {
    await openSpendingLimitPage(driver);
    await clickByTestId(driver, "spending-limit-create");

    await typeByTestId(driver, "spending-limit-amount", "2500");
    await clickByTestId(driver, "spending-limit-submit");
    await waitForOpenModalToClose(driver);
    await waitForNormalizedText(driver, "Limite criado com sucesso!");

    const card = await findByTestId(driver, "spending-limit-card");
    const amount = await findByTestId(driver, "spending-limit-value");
    const cardText = await card.getText();

    assert.match(cardText, /Limite Mensal/);
    assert.match(cardText, /Limite mensal configurado/);
    assert.equal(await amount.getText(), "R$ 2.500,00");
  });
});
