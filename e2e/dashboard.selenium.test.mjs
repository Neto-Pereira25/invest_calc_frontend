import test from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import select from "selenium-webdriver/lib/select.js";

const { Builder, By, until } = selenium;
const { Select } = select;

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

async function setValueByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);

  await driver.executeScript(
    `
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;

      setter.call(arguments[0], arguments[1]);
      arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
      arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
    `,
    element,
    value,
  );

  await sleep(driver);
}

function uniqueEmail() {
  return `helena.dashboard.${Math.random().toString(36).slice(2, 6)}@email.com`;
}

function uniqueDescription(description) {
  return `${description} ${Math.random().toString(36).slice(2, 5)}`;
}

function currentMonthDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(Math.min(now.getDate(), 28)).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
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
    name: "Helena Andrade",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await findByTestId(driver, "dashboard-page");
  await sleep(driver);
}

async function waitForOptions(driver, testId) {
  const element = await findByTestId(driver, testId);

  await driver.wait(async () => {
    const count = await driver.executeScript(
      "return Array.from(arguments[0].querySelectorAll('option[value]')).filter((item) => !['', '0'].includes(item.value)).length;",
      element,
    );

    return count > 0;
  }, 10000, `Opcoes do select ${testId} nao carregaram`);

  return element;
}

async function selectFirstRealOption(driver, testId) {
  const element = await waitForOptions(driver, testId);
  const firstValue = await driver.executeScript(
    "return Array.from(arguments[0].options).find((item) => !['', '0'].includes(item.value))?.value;",
    element,
  );

  const selectObject = new Select(element);
  await selectObject.selectByValue(firstValue);
  await sleep(driver);
}

async function createTransaction(driver, { type, description, amount, date }) {
  await driver.get(`${FRONTEND_URL}/transactions`);
  await waitForPath(driver, "/transactions");
  await clickByTestId(driver, "transaction-new");

  if (type === "INCOME") {
    await clickByTestId(driver, "transaction-type-income");
  } else {
    await clickByTestId(driver, "transaction-type-expense");
  }

  await typeByTestId(driver, "transaction-description", description);
  await selectFirstRealOption(driver, "transaction-category");
  await selectFirstRealOption(driver, "transaction-subcategory");
  await typeByTestId(driver, "transaction-amount", amount);
  await setValueByTestId(driver, "transaction-date", date);
  await clickByTestId(driver, "transaction-submit");

  await driver.wait(async () => {
    const rows = await driver.findElements(By.css('[data-testid="transaction-row"]'));

    for (const row of rows) {
      const text = await row.getText();
      if (text.includes(description)) {
        return true;
      }
    }

    return false;
  }, 10000, `Transacao nao apareceu na lista: ${description}`);

  await sleep(driver);
}

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
}

test("deve exibir resumo financeiro e lancamentos recentes no dashboard", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);

    await waitForNormalizedText(driver, "nenhum lançamento ainda");
    const emptyState = await getTextByTestId(driver, "dashboard-empty");
    assert.match(normalizeText(emptyState), /nenhum lancamento ainda/);

    const date = currentMonthDate();
    const incomeDescription = uniqueDescription("Salario mensal");
    const expenseDescription = uniqueDescription("Compra no supermercado");

    await createTransaction(driver, {
      type: "INCOME",
      description: incomeDescription,
      amount: "6500.00",
      date,
    });

    await createTransaction(driver, {
      type: "EXPENSE",
      description: expenseDescription,
      amount: "850.00",
      date,
    });

    await driver.get(`${FRONTEND_URL}/dashboard`);
    await waitForPath(driver, "/dashboard");
    await findByTestId(driver, "dashboard-page");

    await driver.wait(async () => {
      const incomeCard = await getTextByTestId(driver, "dashboard-income-card");
      const expenseCard = await getTextByTestId(driver, "dashboard-expense-card");
      const balanceCard = await getTextByTestId(driver, "dashboard-balance-card");

      return incomeCard.includes("6500.00") &&
        expenseCard.includes("850.00") &&
        balanceCard.includes("5650.00");
    }, 10000, "Cards do dashboard nao exibiram os totais esperados");

    const incomeCard = await getTextByTestId(driver, "dashboard-income-card");
    const expenseCard = await getTextByTestId(driver, "dashboard-expense-card");
    const balanceCard = await getTextByTestId(driver, "dashboard-balance-card");

    assert.match(incomeCard, /Receitas/i);
    assert.match(incomeCard, /6500\.00/);
    assert.match(expenseCard, /Despesas/i);
    assert.match(expenseCard, /850\.00/);
    assert.match(balanceCard, /Saldo/i);
    assert.match(balanceCard, /5650\.00/);

    const recentTransactions = await getTextByTestId(driver, "dashboard-recent-transactions");
    assert.match(recentTransactions, new RegExp(incomeDescription));
    assert.match(recentTransactions, new RegExp(expenseDescription));

    const rows = await driver.findElements(By.css('[data-testid="dashboard-transaction-row"]'));
    assert.ok(rows.length >= 2, "Dashboard deve listar os lancamentos recentes");
  } finally {
    await driver.quit();
  }
});
