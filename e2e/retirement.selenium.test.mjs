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

async function setSelectByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);

  await driver.executeScript(
    `
      arguments[0].value = arguments[1];
      arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
      arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
    `,
    element,
    value,
  );

  await sleep(driver);
}

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
}

function uniqueEmail() {
  return `aposentadoria.lia.${Math.random().toString(36).slice(2, 6)}@email.com`;
}

function parseBRLCurrency(value) {
  const sanitized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number(sanitized);
}

function extractCurrency(value) {
  const match = value.match(/R\$\s*([\d.]+,\d{2})/);
  assert.ok(match, `Valor monetario nao encontrado em: ${value}`);
  return parseBRLCurrency(match[1]);
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
    name: "Lia Andrade",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openRetirementPage(driver) {
  await driver.get(`${FRONTEND_URL}/retirement-simulator`);
  await waitForPath(driver, "/retirement-simulator");
  await findByTestId(driver, "retirement-simulation-page");
  await sleep(driver);
}

async function fillRetirementForm(driver, {
  desiredIncome,
  interestRate,
  period,
  periodType,
  rateType,
  annualInflation,
  safeWithdrawal,
}) {
  if (desiredIncome !== undefined) {
    await typeByTestId(driver, "retirement-desired-income", desiredIncome);
  }

  if (interestRate !== undefined) {
    await typeByTestId(driver, "retirement-interest-rate", interestRate);
  }

  if (period !== undefined) {
    await typeByTestId(driver, "retirement-period", period);
  }

  if (periodType !== undefined) {
    await setSelectByTestId(driver, "retirement-period-type", periodType);
  }

  if (rateType !== undefined) {
    await setSelectByTestId(driver, "retirement-rate-type", rateType);
  }

  if (annualInflation !== undefined) {
    await typeByTestId(driver, "retirement-annual-inflation", annualInflation);
  }

  if (safeWithdrawal !== undefined) {
    await typeByTestId(driver, "retirement-safe-withdrawal", safeWithdrawal);
  }
}

test("deve simular aposentadoria e limpar os resultados", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openRetirementPage(driver);

    await fillRetirementForm(driver, {
      desiredIncome: "4500,00",
      interestRate: "9,50",
      period: "25",
      periodType: "ANNUAL",
      rateType: "YEARLY",
      annualInflation: "4,00",
      safeWithdrawal: "4,20",
    });

    await clickByTestId(driver, "retirement-submit");

    await findByTestId(driver, "retirement-results");
    await waitForNormalizedText(driver, "aporte mensal necessario", 20000);

    const desiredIncomeText = await getTextByTestId(driver, "retirement-result-income");
    const adjustedIncomeText = await getTextByTestId(driver, "retirement-result-inflation-income");
    const targetAmountText = await getTextByTestId(driver, "retirement-result-target-amount");
    const contributionText = await getTextByTestId(driver, "retirement-result-monthly-contribution");
    const monthsText = await getTextByTestId(driver, "retirement-result-months");
    const inflationText = await getTextByTestId(driver, "retirement-result-used-inflation");
    const withdrawalText = await getTextByTestId(driver, "retirement-result-used-withdrawal");

    const desiredIncome = extractCurrency(desiredIncomeText);
    const adjustedIncome = extractCurrency(adjustedIncomeText);
    const targetAmount = extractCurrency(targetAmountText);
    const requiredContribution = extractCurrency(contributionText);

    assert.equal(desiredIncome, 4500);
    assert.ok(adjustedIncome > desiredIncome);
    assert.ok(targetAmount > adjustedIncome * 12);
    assert.ok(requiredContribution > 0);
    assert.match(monthsText, /300 meses/);
    assert.match(inflationText, /4,00%/);
    assert.match(withdrawalText, /4,20%/);

    await clickByTestId(driver, "retirement-clear");
    await findByTestId(driver, "retirement-empty");

    const incomeInput = await findByTestId(driver, "retirement-desired-income");
    assert.equal(await incomeInput.getAttribute("value"), "");
  } finally {
    await driver.quit();
  }
});

test("deve validar campos obrigatorios antes de simular aposentadoria", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openRetirementPage(driver);

    await typeByTestId(driver, "retirement-interest-rate", "oito");
    await clickByTestId(driver, "retirement-submit");

    await waitForNormalizedText(driver, "renda mensal desejada e obrigatoria");
    await waitForNormalizedText(driver, "taxa de juros deve ser um numero valido");
    await waitForNormalizedText(driver, "periodo e obrigatorio");

    const resultElements = await driver.findElements(By.css('[data-testid="retirement-results"]'));
    assert.equal(resultElements.length, 0);
  } finally {
    await driver.quit();
  }
});
