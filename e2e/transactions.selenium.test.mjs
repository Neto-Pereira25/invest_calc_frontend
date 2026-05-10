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

async function getCurrentPath(driver) {
  const currentUrl = await driver.getCurrentUrl();
  return new URL(currentUrl).pathname;
}

async function waitForPath(driver, expectedPath) {
  await driver.wait(async () => {
    const path = await getCurrentPath(driver);
    return path === expectedPath;
  }, 10000);
}

async function sleep(driver, ms = TEST_PAUSE_MS) {
  await driver.sleep(ms);
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

function uniqueEmail() {
  return `marina.costa.${Date.now()}.${Math.random().toString(36).slice(2)}@email.com`;
}

function uniqueTransactionDescription(description) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${description} ${suffix}`;
}

async function registerUserByUi(driver, { name, email, password }) {
  await driver.get(`${FRONTEND_URL}/register`);

  await typeByTestId(driver, "register-name", name);
  await typeByTestId(driver, "register-email", email);
  await typeByTestId(driver, "register-password", password);
  await typeByTestId(driver, "register-confirm-password", password);

  await clickByTestId(driver, "register-submit");
  await waitForPath(driver, "/");
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

async function openTransactionsPage(driver) {
  await driver.get(`${FRONTEND_URL}/transactions`);
  await waitForPath(driver, "/transactions");
  await sleep(driver);
}

async function waitForOptions(driver, testId) {
  const select = await findByTestId(driver, testId);

  await driver.wait(async () => {
    const count = await driver.executeScript(
      "return arguments[0].querySelectorAll('option[value]:not([value=\"\"])').length;",
      select,
    );

    return count > 0;
  }, 10000);

  return select;
}

async function selectFirstRealOption(driver, testId) {
  const select = await waitForOptions(driver, testId);
  const firstValue = await driver.executeScript(
    "return Array.from(arguments[0].options).find((item) => item.value)?.value;",
    select,
  );

  const selectObject = new Select(select);
  await selectObject.selectByValue(firstValue);
  await sleep(driver);
}

async function fillTransactionForm(driver, { description, amount, date, type }) {
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
}

async function createTransaction(driver, data) {
  await clickByTestId(driver, "transaction-new");
  await fillTransactionForm(driver, data);
  await clickByTestId(driver, "transaction-submit");
  await waitForTransaction(driver, data.description);
  await sleep(driver);
}

async function expectTransactionText(driver, description) {
  const row = await findTransactionRow(driver, description);
  return row.getText();
}

async function closeOpenModal(driver) {
  const closeButton = await driver.wait(
    until.elementLocated(By.css(".modal.show .btn-close")),
    10000,
  );

  await closeButton.click();
  await driver.wait(until.stalenessOf(closeButton), 10000);
  await sleep(driver);
}

async function waitForTransaction(driver, description) {
  try {
    await driver.wait(async () => {
      const rows = await driver.findElements(By.css('[data-testid="transaction-row"]'));

      for (const row of rows) {
        const text = await row.getText();
        if (text.includes(description)) {
          return true;
        }
      }

      return false;
    }, 10000);
  } catch (error) {
    const debug = await driver.executeScript(`
      return {
        text: document.body.innerText,
        description: document.querySelector('[data-testid="transaction-description"]')?.value,
        category: document.querySelector('[data-testid="transaction-category"]')?.value,
        subcategory: document.querySelector('[data-testid="transaction-subcategory"]')?.value,
        amount: document.querySelector('[data-testid="transaction-amount"]')?.value,
        date: document.querySelector('[data-testid="transaction-date"]')?.value,
      };
    `);

    throw new Error(
      `Nao encontrou a transacao "${description}". Estado: ${JSON.stringify(debug)}`,
      { cause: error },
    );
  }
}

async function findTransactionRow(driver, description) {
  await waitForTransaction(driver, description);

  const rows = await driver.findElements(By.css('[data-testid="transaction-row"]'));

  for (const row of rows) {
    const text = await row.getText();
    if (text.includes(description)) {
      return row;
    }
  }

  throw new Error(`Transacao "${description}" nao encontrada`);
}

async function waitForTransactionToDisappear(driver, description) {
  await driver.wait(async () => {
    const rows = await driver.findElements(By.css('[data-testid="transaction-row"]'));

    for (const row of rows) {
      const text = await row.getText();
      if (text.includes(description)) {
        return false;
      }
    }

    return true;
  }, 10000);
}

test("deve gerenciar transacoes em um unico login", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openTransactionsPage(driver);

    const expenseDescription = uniqueTransactionDescription("Conta de energia maio 2026");

    await createTransaction(driver, {
      description: expenseDescription,
      amount: "125.50",
      date: "2026-05-10",
      type: "EXPENSE",
    });

    const expenseText = await expectTransactionText(driver, expenseDescription);

    assert.match(expenseText, /-\s*R\$/);
    assert.match(expenseText, /125,50/);

    const incomeDescription = uniqueTransactionDescription("Salario mensal maio 2026");

    await createTransaction(driver, {
      description: incomeDescription,
      amount: "980.75",
      date: "2026-05-10",
      type: "INCOME",
    });

    const incomeText = await expectTransactionText(driver, incomeDescription);

    assert.match(incomeText, /\+\s*R\$/);
    assert.match(incomeText, /980,75/);
 
    await clickByTestId(driver, "transaction-new");
    await typeByTestId(
      driver,
      "transaction-description",
      uniqueTransactionDescription("Consulta medica particular"),
    );
    await typeByTestId(driver, "transaction-amount", "10.00");
    await setValueByTestId(driver, "transaction-date", "2026-05-10");
    await clickByTestId(driver, "transaction-submit");

    const modal = await driver.wait(
      until.elementLocated(By.css(".modal.show")),
      10000,
    );
    const modalText = await modal.getText();

    assert.match(modalText, /Selecione uma subcategoria/);
    await closeOpenModal(driver);

    const editedExpenseDescription = uniqueTransactionDescription("Conta de energia ajustada maio 2026");

    const row = await findTransactionRow(driver, expenseDescription);
    const editButton = await row.findElement(By.css('[data-testid="transaction-edit"]'));
    await editButton.click();
    await sleep(driver);

    await typeByTestId(driver, "transaction-description", editedExpenseDescription);
    await typeByTestId(driver, "transaction-amount", "132.40");
    await selectFirstRealOption(driver, "transaction-subcategory");
    await clickByTestId(driver, "transaction-submit");

    const editedText = await expectTransactionText(driver, editedExpenseDescription);

    assert.match(editedText, /132,40/);
    await waitForTransactionToDisappear(driver, expenseDescription);

    const deleteRow = await findTransactionRow(driver, incomeDescription);
    const deleteButton = await deleteRow.findElement(By.css('[data-testid="transaction-delete"]'));
    await deleteButton.click();

    const alert = await driver.wait(until.alertIsPresent(), 10000);
    await sleep(driver);
    await alert.accept();
    await sleep(driver);

    await waitForTransactionToDisappear(driver, incomeDescription);
  } finally {
    await driver.quit();
  }
});
