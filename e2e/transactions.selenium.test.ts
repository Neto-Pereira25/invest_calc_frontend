import test from "node:test";
import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";
import type { WebDriver, WebElement } from "selenium-webdriver";
import { Options as ChromeOptions } from "selenium-webdriver/chrome";
import { Select } from "selenium-webdriver/lib/select";

const FRONTEND_URL: string = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
const TEST_PAUSE_MS: number = Number(process.env.SELENIUM_TEST_PAUSE_MS ?? 900);

interface UserCredentials {
  name: string;
  email: string;
  password: string;
}

interface TransactionData {
  description: string;
  amount: string;
  date: string;
  type: "INCOME" | "EXPENSE";
}

async function createDriver(): Promise<WebDriver> {
  const options = new ChromeOptions();

  // options.addArguments("--headless=new");
  options.addArguments("--window-size=1366,1000");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function clearStorage(driver: WebDriver): Promise<void> {
  await driver.executeScript(`
    window.localStorage.clear();
    window.sessionStorage.clear();
  `);
}

async function getCurrentPath(driver: WebDriver): Promise<string> {
  const currentUrl = await driver.getCurrentUrl();
  return new URL(currentUrl).pathname;
}

async function waitForPath(driver: WebDriver, expectedPath: string): Promise<void> {
  await driver.wait(async () => {
    const path = await getCurrentPath(driver);
    return path === expectedPath;
  }, 10000);
}

async function sleep(driver: WebDriver, ms: number = TEST_PAUSE_MS): Promise<void> {
  await driver.sleep(ms);
}

async function findByTestId(driver: WebDriver, testId: string): Promise<WebElement> {
  const selector = `[data-testid="${testId}"]`;
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    10000,
  );

  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(until.elementIsEnabled(element), 10000);

  return element;
}

async function typeByTestId(driver: WebDriver, testId: string, value: string): Promise<void> {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await sleep(driver);
}

async function setValueByTestId(driver: WebDriver, testId: string, value: string): Promise<void> {
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

async function clickByTestId(driver: WebDriver, testId: string): Promise<void> {
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
    if ((error as Error & { name: string }).name !== "ElementClickInterceptedError") {
      throw error;
    }

    await driver.executeScript("arguments[0].click();", element);
  }

  await sleep(driver);
}

function uniqueEmail(): string {
  return `marina.costa.${Date.now()}.${Math.random().toString(36).slice(2)}@email.com`;
}

function uniqueTransactionDescription(description: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${description} ${suffix}`;
}

async function registerUserByUi(
  driver: WebDriver,
  { name, email, password }: UserCredentials,
): Promise<void> {
  await driver.get(`${FRONTEND_URL}/register`);

  await typeByTestId(driver, "register-name", name);
  await typeByTestId(driver, "register-email", email);
  await typeByTestId(driver, "register-password", password);
  await typeByTestId(driver, "register-confirm-password", password);

  await clickByTestId(driver, "register-submit");
  await waitForPath(driver, "/");
  await sleep(driver);
}

async function loginAsNewUser(driver: WebDriver): Promise<void> {
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

async function openTransactionsPage(driver: WebDriver): Promise<void> {
  await driver.get(`${FRONTEND_URL}/transactions`);
  await waitForPath(driver, "/transactions");
  await sleep(driver);
}

async function waitForOptions(driver: WebDriver, testId: string): Promise<WebElement> {
  const selectEl = await findByTestId(driver, testId);

  await driver.wait(async () => {
    const count = await driver.executeScript<number>(
      "return arguments[0].querySelectorAll('option[value]:not([value=\"\"])').length;",
      selectEl,
    );

    return count > 0;
  }, 10000);

  return selectEl;
}

async function selectFirstRealOption(driver: WebDriver, testId: string): Promise<void> {
  const selectEl = await waitForOptions(driver, testId);
  const firstValue = await driver.executeScript<string>(
    "return Array.from(arguments[0].options).find((item) => item.value)?.value;",
    selectEl,
  );

  const selectObject = new Select(selectEl);
  await selectObject.selectByValue(firstValue);
  await sleep(driver);
}

async function fillTransactionForm(
  driver: WebDriver,
  { description, amount, date, type }: TransactionData,
): Promise<void> {
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

async function createTransaction(driver: WebDriver, data: TransactionData): Promise<void> {
  await clickByTestId(driver, "transaction-new");
  await fillTransactionForm(driver, data);
  await clickByTestId(driver, "transaction-submit");
  await waitForTransaction(driver, data.description);
  await sleep(driver);
}

async function expectTransactionText(driver: WebDriver, description: string): Promise<string> {
  const row = await findTransactionRow(driver, description);
  return row.getText();
}

async function closeOpenModal(driver: WebDriver): Promise<void> {
  const closeButton = await driver.wait(
    until.elementLocated(By.css(".modal.show .btn-close")),
    10000,
  );

  await closeButton.click();
  await driver.wait(until.stalenessOf(closeButton), 10000);
  await sleep(driver);
}

async function waitForTransaction(driver: WebDriver, description: string): Promise<void> {
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
    const debug = await driver.executeScript<Record<string, string | null>>(`
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

async function findTransactionRow(driver: WebDriver, description: string): Promise<WebElement> {
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

async function waitForTransactionToDisappear(
  driver: WebDriver,
  description: string,
): Promise<void> {
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

    // Tenta submeter sem subcategoria — deve exibir erro no modal
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

    // Edita a despesa
    const editedExpenseDescription = uniqueTransactionDescription(
      "Conta de energia ajustada maio 2026",
    );

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

    // Exclui a receita via modal de confirmação
    const deleteRow = await findTransactionRow(driver, incomeDescription);
    const deleteButton = await deleteRow.findElement(
      By.css('[data-testid="transaction-delete"]'),
    );
    await deleteButton.click();
    await sleep(driver);

    await clickByTestId(driver, "confirm-delete-confirm");

    await waitForTransactionToDisappear(driver, incomeDescription);
  } finally {
    await driver.quit();
  }
});
