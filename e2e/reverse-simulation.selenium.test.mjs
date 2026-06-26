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
  return `reversa.marina.${Math.random().toString(36).slice(2, 6)}@email.com`;
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
    name: "Marina Costa",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openReverseSimulationPage(driver) {
  await driver.get(`${FRONTEND_URL}/reverse-simulation`);
  await waitForPath(driver, "/reverse-simulation");
  await findByTestId(driver, "reverse-simulation-page");
  await sleep(driver);
}

async function fillContributionMode(driver, {
  targetAmount,
  interestRate,
  period,
  periodType,
  rateType,
}) {
  if (targetAmount !== undefined) {
    await typeByTestId(driver, "reverse-contribution-target-amount", targetAmount);
  }

  if (interestRate !== undefined) {
    await typeByTestId(driver, "reverse-contribution-interest-rate", interestRate);
  }

  if (period !== undefined) {
    await typeByTestId(driver, "reverse-contribution-period", period);
  }

  if (periodType !== undefined) {
    await setSelectByTestId(driver, "reverse-contribution-period-type", periodType);
  }

  if (rateType !== undefined) {
    await setSelectByTestId(driver, "reverse-contribution-rate-type", rateType);
  }
}

async function fillPeriodMode(driver, {
  targetAmount,
  interestRate,
  monthlyContribution,
  rateType,
}) {
  if (targetAmount !== undefined) {
    await typeByTestId(driver, "reverse-period-target-amount", targetAmount);
  }

  if (interestRate !== undefined) {
    await typeByTestId(driver, "reverse-period-interest-rate", interestRate);
  }

  if (monthlyContribution !== undefined) {
    await typeByTestId(driver, "reverse-period-monthly-contribution", monthlyContribution);
  }

  if (rateType !== undefined) {
    await setSelectByTestId(driver, "reverse-period-rate-type", rateType);
  }
}

test("deve calcular aporte mensal e prazo na simulacao reversa", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openReverseSimulationPage(driver);

    await fillContributionMode(driver, {
      targetAmount: "120000,00",
      interestRate: "10,50",
      period: "8",
      periodType: "ANNUAL",
      rateType: "YEARLY",
    });

    await clickByTestId(driver, "reverse-contribution-submit");
    await findByTestId(driver, "reverse-results");
    await waitForNormalizedText(driver, "aporte mensal necessario", 20000);

    const contributionHighlight = await getTextByTestId(driver, "reverse-result-highlight-contribution");
    const contributionTarget = await getTextByTestId(driver, "reverse-result-target-amount");
    const informedPeriod = await getTextByTestId(driver, "reverse-result-informed-period");
    const monthlyRate = await getTextByTestId(driver, "reverse-result-monthly-rate");

    assert.ok(extractCurrency(contributionHighlight) > 0);
    assert.equal(extractCurrency(contributionTarget), 120000);
    assert.match(informedPeriod, /8\s+anos/i);
    assert.match(monthlyRate, /%/);

    await clickByTestId(driver, "reverse-mode-period");
    await findByTestId(driver, "reverse-empty");

    await fillPeriodMode(driver, {
      targetAmount: "90000,00",
      interestRate: "0,85",
      monthlyContribution: "1200,00",
      rateType: "MONTHLY",
    });

    await clickByTestId(driver, "reverse-period-submit");
    await findByTestId(driver, "reverse-results");
    await waitForNormalizedText(driver, "prazo necessario", 20000);

    const periodHighlight = await getTextByTestId(driver, "reverse-result-highlight-period");
    const periodTarget = await getTextByTestId(driver, "reverse-result-target-amount");
    const informedContribution = await getTextByTestId(driver, "reverse-result-informed-contribution");

    assert.match(periodHighlight, /anos|meses/i);
    assert.equal(extractCurrency(periodTarget), 90000);
    assert.equal(extractCurrency(informedContribution), 1200);

    await clickByTestId(driver, "reverse-period-clear");
    await findByTestId(driver, "reverse-empty");

    const targetInput = await findByTestId(driver, "reverse-period-target-amount");
    assert.equal(await targetInput.getAttribute("value"), "");
  } finally {
    await driver.quit();
  }
});

test("deve validar dados invalidos antes de simular", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openReverseSimulationPage(driver);

    await typeByTestId(driver, "reverse-contribution-target-amount", "0");
    await typeByTestId(driver, "reverse-contribution-interest-rate", "0");
    await typeByTestId(driver, "reverse-contribution-period", "0");
    await clickByTestId(driver, "reverse-contribution-submit");

    await waitForNormalizedText(driver, "deve ser um valor maior que zero");
    await waitForNormalizedText(driver, "deve ser maior que zero");
    await waitForNormalizedText(driver, "deve ser um numero maior que zero");

    const resultElements = await driver.findElements(By.css('[data-testid="reverse-results"]'));
    assert.equal(resultElements.length, 0);
  } finally {
    await driver.quit();
  }
});
