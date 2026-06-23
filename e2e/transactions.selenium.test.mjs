import test from "node:test";
import assert from "node:assert/strict";
import { createDriver } from "./support/driver.mjs";
import { FRONTEND_URL } from "./support/config.mjs";
import { loginOnce } from "./support/auth.mjs";
import {
  By,
  until,
  clickByTestId,
  findByTestId,
  selectFirstRealOption,
  setValueByTestId,
  sleep,
  typeByTestId,
  waitForPath,
} from "./support/ui.mjs";

function uniqueTransactionDescription(description) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${description} ${suffix}`;
}

async function openTransactionsPage(driver) {
  await driver.get(`${FRONTEND_URL}/transactions`);
  await waitForPath(driver, "/transactions");
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

test("deve gerenciar transacoes em um unico login com dados persistidos no MySQL", async () => {
  const driver = await createDriver();

  try {
    await loginOnce(driver);
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

    assert.match(modalText, /Subcategoria é obrigatória|Selecione uma subcategoria/);
    await closeOpenModal(driver);

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

    const deleteRow = await findTransactionRow(driver, incomeDescription);
    const deleteButton = await deleteRow.findElement(By.css('[data-testid="transaction-delete"]'));
    await deleteButton.click();

    await clickByTestId(driver, "confirm-delete-confirm");

    await waitForTransactionToDisappear(driver, incomeDescription);
  } finally {
    await driver.quit();
  }
});
