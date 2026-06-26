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

async function findVisibleByTestId(driver, testId) {
  const selector = `[data-testid="${testId}"]`;
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    10000,
  );

  await driver.wait(until.elementIsVisible(element), 10000);

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

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
}

function uniqueEmail() {
  return `cenario.helena.${Math.random().toString(36).slice(2, 6)}@email.com`;
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
    name: "Helena Ribeiro",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openScenarioComparisonPage(driver) {
  await driver.get(`${FRONTEND_URL}/scenario-comparison`);
  await waitForPath(driver, "/scenario-comparison");
  await findByTestId(driver, "scenario-comparison-page");
  await sleep(driver);
}

async function fillScenario(driver, index, {
  name,
  initialCapital,
  monthlyContribution,
  interestRate,
  months,
}) {
  await typeByTestId(driver, `scenario-name-${index}`, name);
  await typeByTestId(driver, `scenario-initial-capital-${index}`, initialCapital);
  await typeByTestId(driver, `scenario-monthly-contribution-${index}`, monthlyContribution);
  await typeByTestId(driver, `scenario-interest-rate-${index}`, interestRate);
  await typeByTestId(driver, `scenario-months-${index}`, months);
}

async function resultRows(driver) {
  await findByTestId(driver, "scenario-result-table");
  return driver.findElements(By.css('[data-testid="scenario-result-row"]'));
}

test("deve comparar cenarios de investimento e destacar o melhor resultado", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openScenarioComparisonPage(driver);

    let cards = await driver.findElements(By.css('[data-testid="scenario-card"]'));
    assert.equal(cards.length, 2);

    const firstRemoveButton = await findVisibleByTestId(driver, "scenario-remove-0");
    assert.equal(await firstRemoveButton.isEnabled(), false);

    await clickByTestId(driver, "scenario-add");
    cards = await driver.findElements(By.css('[data-testid="scenario-card"]'));
    assert.equal(cards.length, 3);

    await fillScenario(driver, 0, {
      name: "Tesouro IPCA",
      initialCapital: "15000,00",
      monthlyContribution: "800,00",
      interestRate: "0,72",
      months: "36",
    });

    await fillScenario(driver, 1, {
      name: "Carteira arrojada",
      initialCapital: "15000,00",
      monthlyContribution: "800,00",
      interestRate: "1,05",
      months: "36",
    });

    await fillScenario(driver, 2, {
      name: "Reserva conservadora",
      initialCapital: "15000,00",
      monthlyContribution: "800,00",
      interestRate: "0,55",
      months: "36",
    });

    await clickByTestId(driver, "scenario-remove-2");
    cards = await driver.findElements(By.css('[data-testid="scenario-card"]'));
    assert.equal(cards.length, 2);

    await clickByTestId(driver, "scenario-submit");

    await waitForNormalizedText(driver, "Resultado da Comparação", 20000);
    await waitForNormalizedText(driver, "Melhor cenário");

    const bestInfo = await getTextByTestId(driver, "scenario-best-info");
    assert.match(normalizeText(bestInfo), /carteira arrojada/);

    const rows = await resultRows(driver);
    assert.equal(rows.length, 2);

    const tableText = normalizeText(await getTextByTestId(driver, "scenario-result-table"));
    assert.match(tableText, /tesouro ipca/);
    assert.match(tableText, /carteira arrojada/);
    assert.match(tableText, /r\$/);

    await clickByTestId(driver, "scenario-clear");
    await driver.wait(async () => {
      const rowsAfterClear = await driver.findElements(By.css('[data-testid="scenario-result-row"]'));
      return rowsAfterClear.length === 0;
    }, 10000, "Resultado da comparacao deve sumir apos limpar");

    const bodyTextAfterClear = normalizeText(await getBodyText(driver));
    assert.ok(!bodyTextAfterClear.includes("resultado da comparacao"));
    assert.ok(!bodyTextAfterClear.includes("carteira arrojada"));
  } finally {
    await driver.quit();
  }
});

test("deve validar taxa de juros invalida antes de comparar cenarios", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openScenarioComparisonPage(driver);

    await fillScenario(driver, 0, {
      name: "Plano conservador",
      initialCapital: "10000,00",
      monthlyContribution: "500,00",
      interestRate: "0",
      months: "24",
    });

    await fillScenario(driver, 1, {
      name: "Plano moderado",
      initialCapital: "10000,00",
      monthlyContribution: "500,00",
      interestRate: "0,85",
      months: "24",
    });

    await clickByTestId(driver, "scenario-submit");
    await waitForNormalizedText(driver, "Taxa de juros deve ser maior que zero");

    const rows = await driver.findElements(By.css('[data-testid="scenario-result-row"]'));
    assert.equal(rows.length, 0);
  } finally {
    await driver.quit();
  }
});
