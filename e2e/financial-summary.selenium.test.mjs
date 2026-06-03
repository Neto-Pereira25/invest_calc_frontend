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

function normalizeText(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function getBodyText(driver) {
  return driver.executeScript("return document.body?.innerText ?? ''; ");
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
  return `financeiro.${Date.now()}.${Math.random().toString(36).slice(2)}@email.com`;
}

function uniqueTransactionDescription(description) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${description} ${suffix}`;
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
    name: "Joana Financas",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
}

async function openSpendingLimitPage(driver) {
  await driver.get(`${FRONTEND_URL}/spending-limit`);
  await waitForPath(driver, "/spending-limit");
  await findByTestId(driver, "spending-limit-page");
}

async function waitForModalClose(driver) {
  try {
    await driver.wait(async () => {
      const modals = await driver.findElements(By.css(".modal.show"));
      return modals.length === 0;
    }, 10000, "Modal de limite nao fechou apos submit");
  } catch (error) {
    const bodyText = await getBodyText(driver);

    throw new Error(
      `Modal de limite nao fechou. Texto da tela: ${bodyText.slice(0, 1000)}`,
      { cause: error },
    );
  }
}

async function defineMonthlyLimit(driver, amount) {
  await openSpendingLimitPage(driver);

  await driver.wait(async () => {
    const createButtons = await driver.findElements(By.css('[data-testid="spending-limit-create"]'));
    const actionButtons = await driver.findElements(By.css('[data-testid="spending-limit-actions"]'));

    return createButtons.length > 0 || actionButtons.length > 0;
  }, 10000, "Controles de limite mensal nao carregaram");

  const createButtons = await driver.findElements(By.css('[data-testid="spending-limit-create"]'));

  if (createButtons.length > 0) {
    await clickElement(driver, createButtons[0]);
  } else {
    await clickByTestId(driver, "spending-limit-actions");
    await clickByTestId(driver, "spending-limit-edit");
  }

  await typeByTestId(driver, "spending-limit-amount", amount);
  await clickByTestId(driver, "spending-limit-submit");
  await waitForModalClose(driver);
  await sleep(driver);
}

async function openTransactionsPage(driver) {
  await driver.get(`${FRONTEND_URL}/transactions`);
  await waitForPath(driver, "/transactions");
  await sleep(driver);
}

async function waitForOptions(driver, testId) {
  const selectElement = await findByTestId(driver, testId);

  await driver.wait(async () => {
    const count = await driver.executeScript(
      "return Array.from(arguments[0].querySelectorAll('option[value]')).filter((item) => !['', '0'].includes(item.value)).length;",
      selectElement,
    );

    return count > 0;
  }, 10000, `Select sem opcoes carregadas: ${testId}`);

  return selectElement;
}

async function selectFirstRealOption(driver, testId) {
  const selectElement = await waitForOptions(driver, testId);
  const firstValue = await driver.executeScript(
    "return Array.from(arguments[0].options).find((item) => !['', '0'].includes(item.value))?.value;",
    selectElement,
  );

  const selectObject = new Select(selectElement);
  await selectObject.selectByValue(firstValue);
  await sleep(driver);
}

async function selectCategoryWithSubcategory(driver) {
  const categorySelect = await waitForOptions(driver, "transaction-category");
  const categoryValues = await driver.executeScript(
    "return Array.from(arguments[0].options).filter((item) => !['', '0'].includes(item.value)).map((item) => item.value);",
    categorySelect,
  );

  const categoryObject = new Select(categorySelect);

  for (const value of categoryValues) {
    await categoryObject.selectByValue(value);
    await sleep(driver);

    const subcategorySelect = await findByTestId(driver, "transaction-subcategory");
    const subcategoryCount = await driver.executeScript(
      "return Array.from(arguments[0].querySelectorAll('option[value]')).filter((item) => !['', '0'].includes(item.value)).length;",
      subcategorySelect,
    );

    if (subcategoryCount > 0) {
      return;
    }
  }

  throw new Error("Nenhuma categoria com subcategoria disponivel para criar lancamento");
}

async function fillTransactionForm(driver, { description, amount, date }) {
  await clickByTestId(driver, "transaction-type-expense");
  await typeByTestId(driver, "transaction-description", description);
  await selectCategoryWithSubcategory(driver);
  await selectFirstRealOption(driver, "transaction-subcategory");
  await typeByTestId(driver, "transaction-amount", amount);
  await setValueByTestId(driver, "transaction-date", date);
}

async function createExpenseTransaction(driver, { description, amount, date }) {
  await openTransactionsPage(driver);
  await clickByTestId(driver, "transaction-new");
  await fillTransactionForm(driver, { description, amount, date });
  await clickByTestId(driver, "transaction-submit");
  await waitForNormalizedText(driver, description, 10000);
}

async function openDashboardPage(driver) {
  await driver.get(`${FRONTEND_URL}/dashboard`);
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function expectAlertVisible(driver) {
  const alert = await findByTestId(driver, "financial-limit-alert");
  const text = await alert.getText();

  assert.ok(text.length > 0, "Alerta financeiro deve conter texto");
  return text;
}

async function expectAlertHidden(driver) {
  await driver.wait(async () => {
    const elements = await driver.findElements(By.css('[data-testid="financial-limit-alert"]'));
    return elements.length === 0;
  }, 10000, "Alerta financeiro deveria estar oculto");
}

test("deve exibir toast de atencao e alerta no dashboard ao atingir o limite", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await defineMonthlyLimit(driver, "100.00");

    const description = uniqueTransactionDescription("Despesa proxima do limite");

    await createExpenseTransaction(driver, {
      description,
      amount: "85.00",
      date: currentMonthDate(),
    });

    await waitForNormalizedText(driver, "do limite mensal ja foi utilizado", 10000);

    await openDashboardPage(driver);

    const alertText = await expectAlertVisible(driver);

    assert.match(normalizeText(alertText), /status do limite mensal/);
    assert.match(normalizeText(alertText), /percentual utilizado/);

    await clickByTestId(driver, "financial-limit-alert-close");
    await expectAlertHidden(driver);
  } finally {
    await driver.quit();
  }
});

test("deve exibir toast critico e alerta de limite ultrapassado", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await defineMonthlyLimit(driver, "100.00");

    const description = uniqueTransactionDescription("Despesa acima do limite");

    await createExpenseTransaction(driver, {
      description,
      amount: "130.00",
      date: currentMonthDate(),
    });

    await waitForNormalizedText(driver, "limite mensal ultrapassado em", 10000);

    await openDashboardPage(driver);

    const alertText = await expectAlertVisible(driver);

    assert.match(normalizeText(alertText), /voce ultrapassou o limite em/);
  } finally {
    await driver.quit();
  }
});

test("nao deve exibir alerta quando o limite ainda nao estiver proximo", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await defineMonthlyLimit(driver, "1000.00");

    const description = uniqueTransactionDescription("Despesa abaixo do limite");

    await createExpenseTransaction(driver, {
      description,
      amount: "100.00",
      date: currentMonthDate(),
    });

    await openDashboardPage(driver);
    await expectAlertHidden(driver);
  } finally {
    await driver.quit();
  }
});
