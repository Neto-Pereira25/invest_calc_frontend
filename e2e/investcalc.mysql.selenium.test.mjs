import test from "node:test";
import assert from "node:assert/strict";
import { createDriver } from "./support/driver.mjs";
import { FRONTEND_URL } from "./support/config.mjs";
import { cleanupLoggedE2eUser, loginOnce } from "./support/auth.mjs";
import {
  By,
  until,
  clickByTestId,
  clickElement,
  findByTestId,
  selectFirstRealOption,
  setValueByTestId,
  sleep,
  typeByTestId,
  waitForPath,
} from "./support/ui.mjs";

function normalizeText(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function getBodyText(driver) {
  return driver.executeScript("return document.body?.innerText ?? '';");
}

async function getTextByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  return element.getText();
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

async function clickButtonByText(driver, text) {
  const button = await driver.wait(
    until.elementLocated(
      By.xpath(`//button[contains(normalize-space(.), "${text}")]`),
    ),
    10000,
  );

  await clickElement(driver, button);
}

function parseBRLCurrency(value) {
  const sanitized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  return Number(sanitized);
}

function extractCurrency(value) {
  const match = value.match(/R\$\s*([\d.]+,\d{2})/);
  assert.ok(match, `Valor monetario nao encontrado em: ${value}`);
  return parseBRLCurrency(match[1]);
}

async function waitForNormalizedText(driver, expectedText, timeout = 10000) {
  const normalizedExpected = normalizeText(expectedText);

  await driver.wait(async () => {
    const bodyText = await getBodyText(driver);
    return normalizeText(bodyText).includes(normalizedExpected);
  }, timeout, `Texto nao encontrado: ${expectedText}`);
}

async function waitForOpenModalToClose(driver) {
  await driver.wait(async () => {
    const modals = await driver.findElements(By.css(".modal.show"));
    return modals.length === 0;
  }, 10000);
}

async function openPage(driver, path, testId) {
  await driver.get(`${FRONTEND_URL}${path}`);
  await waitForPath(driver, path);

  if (testId) {
    await findByTestId(driver, testId);
  }

  await sleep(driver);
}

async function showAboutPage(driver) {
  await openPage(driver, "/about");
  await waitForNormalizedText(driver, "Sobre o InvestCalc");
  await waitForNormalizedText(driver, "Apresentação do Projeto");
  await waitForNormalizedText(driver, "Equipe Desenvolvedora");
  await waitForNormalizedText(driver, "Maria Helena");

  const sectionTitles = await driver.findElements(By.css("h2"));
  assert.ok(sectionTitles.length >= 9, "A pagina Sobre deve exibir suas secoes");

  for (const title of sectionTitles) {
    await driver.executeScript(
      'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
      title,
    );
    await sleep(driver, 3500);
  }

  await driver.executeScript("window.scrollTo(0, 0);");
  await sleep(driver, 2500);
}

async function createTransaction(driver, { type, description, amount, date }) {
  await openPage(driver, "/transactions");
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

  await waitForTransaction(driver, description);
}

async function waitForTransaction(driver, description) {
  await driver.wait(async () => {
    const rows = await driver.findElements(By.css('[data-testid="transaction-row"]'));

    for (const row of rows) {
      const text = await row.getText();
      if (text.includes(description)) {
        return true;
      }
    }

    return false;
  }, 10000, `Transacao nao encontrada: ${description}`);
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
  }, 10000, `Transacao ainda visivel: ${description}`);
}

async function validateTransactionScenarios(driver) {
  await openPage(driver, "/transactions");

  const invalidDescription = "Consulta medica particular";
  await clickByTestId(driver, "transaction-new");
  await typeByTestId(driver, "transaction-description", invalidDescription);
  await typeByTestId(driver, "transaction-amount", "10.00");
  await setValueByTestId(driver, "transaction-date", "2026-05-10");
  await clickByTestId(driver, "transaction-submit");
  await waitForNormalizedText(driver, "subcategoria");

  const closeButton = await driver.wait(
    until.elementLocated(By.css(".modal.show .btn-close")),
    10000,
  );
  await clickElement(driver, closeButton);
  await waitForOpenModalToClose(driver);

  const originalDescription = "Conta de energia maio 2026";
  const editedDescription = "Conta de energia ajustada maio 2026";
  await createTransaction(driver, {
    type: "EXPENSE",
    description: originalDescription,
    amount: "125.50",
    date: "2026-05-10",
  });

  const originalRow = await findTransactionRow(driver, originalDescription);
  await clickElement(
    driver,
    await originalRow.findElement(By.css('[data-testid="transaction-edit"]')),
  );
  await typeByTestId(driver, "transaction-description", editedDescription);
  await typeByTestId(driver, "transaction-amount", "132.40");
  await selectFirstRealOption(driver, "transaction-subcategory");
  await clickByTestId(driver, "transaction-submit");

  const editedRow = await findTransactionRow(driver, editedDescription);
  assert.match(await editedRow.getText(), /132,40/);
  await waitForTransactionToDisappear(driver, originalDescription);

  const incomeToDelete = "Rendimento extra maio 2026";
  await createTransaction(driver, {
    type: "INCOME",
    description: incomeToDelete,
    amount: "980.75",
    date: "2026-05-10",
  });

  const deleteRow = await findTransactionRow(driver, incomeToDelete);
  await clickElement(
    driver,
    await deleteRow.findElement(By.css('[data-testid="transaction-delete"]')),
  );
  await clickByTestId(driver, "confirm-delete-confirm");
  await waitForTransactionToDisappear(driver, incomeToDelete);
}

async function createGoal(driver, { name, targetAmount, deadline }) {
  await openPage(driver, "/goals");
  await findByTestId(driver, "goal-new");
  await clickByTestId(driver, "goal-new");
  await typeByTestId(driver, "goal-name", name);
  await typeByTestId(driver, "goal-target-amount", targetAmount);
  await setValueByTestId(driver, "goal-deadline", deadline);
  await clickByTestId(driver, "goal-submit");
  await waitForGoal(driver, name);
}

async function waitForGoal(driver, goalName) {
  await driver.wait(async () => {
    const cards = await driver.findElements(By.css('[data-testid="goal-card"]'));

    for (const card of cards) {
      const text = await card.getText();
      if (text.includes(goalName)) {
        return true;
      }
    }

    return false;
  }, 10000, `Meta nao encontrada: ${goalName}`);
}

async function findGoalCard(driver, goalName) {
  await waitForGoal(driver, goalName);

  const cards = await driver.findElements(By.css('[data-testid="goal-card"]'));

  for (const card of cards) {
    const text = await card.getText();
    if (text.includes(goalName)) {
      return card;
    }
  }

  throw new Error(`Meta "${goalName}" nao encontrada`);
}

async function clickGoalAction(driver, goalName, actionTestId) {
  const card = await findGoalCard(driver, goalName);
  const actionsButton = await card.findElement(By.css('[data-testid="goal-actions"]'));

  await clickElement(driver, actionsButton);

  const action = await card.findElement(By.css(`[data-testid="${actionTestId}"]`));
  await clickElement(driver, action);
}

async function updateGoalProgress(driver, goalName, currentAmount) {
  await clickGoalAction(driver, goalName, "goal-update-progress");
  await typeByTestId(driver, "goal-current-amount", currentAmount);
  await clickByTestId(driver, "goal-progress-submit");
  await waitForGoal(driver, goalName);
}

async function deleteGoal(driver, goalName) {
  await clickGoalAction(driver, goalName, "goal-delete");
  await clickByTestId(driver, "goal-delete-confirm");

  await driver.wait(async () => {
    const bodyText = await getBodyText(driver);
    return !bodyText.includes(goalName);
  }, 10000, `Meta nao foi removida: ${goalName}`);
}

async function validateTwoGoalsAndDeleteOne(driver) {
  const emergencyGoal = "Reserva de emergencia";
  const travelGoal = "Viagem para Recife";

  await createGoal(driver, {
    name: emergencyGoal,
    targetAmount: "12000",
    deadline: "2026-12-20",
  });

  await createGoal(driver, {
    name: travelGoal,
    targetAmount: "8500",
    deadline: "2026-11-20",
  });

  await updateGoalProgress(driver, emergencyGoal, "3000");
  await updateGoalProgress(driver, travelGoal, "2125");

  const emergencyCard = await findGoalCard(driver, emergencyGoal);
  const emergencyText = await emergencyCard.getText();
  assert.match(emergencyText, /R\$\s*3\.000,00/);
  assert.match(emergencyText, /25%/);

  const travelCard = await findGoalCard(driver, travelGoal);
  const travelText = await travelCard.getText();
  assert.match(travelText, /R\$\s*2\.125,00/);
  assert.match(travelText, /25%/);

  await deleteGoal(driver, emergencyGoal);

  const remainingTravelCard = await findGoalCard(driver, travelGoal);
  const bodyText = await getBodyText(driver);
  assert.ok(!bodyText.includes(emergencyGoal));
  assert.match(await remainingTravelCard.getText(), new RegExp(travelGoal));

  const completedGoal = "Bicicleta nova";
  await createGoal(driver, {
    name: completedGoal,
    targetAmount: "1000",
    deadline: "2026-07-15",
  });
  await updateGoalProgress(driver, completedGoal, "1000");
  assert.match(await (await findGoalCard(driver, completedGoal)).getText(), /100%/);

  const exceededGoal = "Moveis da sala";
  await createGoal(driver, {
    name: exceededGoal,
    targetAmount: "2000",
    deadline: "2026-12-05",
  });
  await updateGoalProgress(driver, exceededGoal, "2500");
  const exceededCard = await findGoalCard(driver, exceededGoal);
  assert.match(await exceededCard.getText(), /100%/);

  const invalidGoal = "Reserva para consulta medica";
  await createGoal(driver, {
    name: invalidGoal,
    targetAmount: "900",
    deadline: "2026-09-18",
  });
  await clickGoalAction(driver, invalidGoal, "goal-update-progress");
  await typeByTestId(driver, "goal-current-amount", "-50");
  await clickByTestId(driver, "goal-progress-submit");
  await waitForNormalizedText(driver, "O valor atual não pode ser negativo");
  const modalCloseButtons = await driver.findElements(By.css(".modal.show .btn-close"));
  if (modalCloseButtons.length > 0) {
    await clickElement(driver, modalCloseButtons[0]);
    await waitForOpenModalToClose(driver);
  }

  await clickByTestId(driver, "goal-new");
  await clickByTestId(driver, "goal-submit");
  await waitForNormalizedText(driver, "O nome deve ter no mínimo 3 caracteres");
  await waitForNormalizedText(driver, "A data limite é obrigatória");
  await clickByTestId(driver, "goal-cancel");
  await waitForOpenModalToClose(driver);
}

async function simulateCompoundInterest(driver) {
  await openPage(driver, "/compound-interest-simulator");
  await typeByTestId(driver, "simulation-initial-value", "20000");
  await typeByTestId(driver, "simulation-interest-rate", "12");
  await typeByTestId(driver, "simulation-period", "2");
  await typeByTestId(driver, "simulation-monthly-contribution", "1000");
  await setSelectByTestId(driver, "simulation-period-type", "ANNUAL");
  await setSelectByTestId(driver, "simulation-rate-type", "YEARLY");
  await clickButtonByText(driver, "Calcular");
  await waitForNormalizedText(driver, "valor total final", 20000);

  const rows = await driver.findElements(By.css("table tbody tr"));
  assert.ok(rows.length > 0, "A simulacao de juros compostos deve exibir tabela");

  await clickButtonByText(driver, "Limpar");
  await typeByTestId(driver, "simulation-interest-rate", "abc");
  await clickButtonByText(driver, "Calcular");
  await waitForNormalizedText(driver, "taxa de juros deve ser um numero");
}

async function useRateConverter(driver) {
  await clickByTestId(driver, "open-rate-converter");
  await findByTestId(driver, "rate-converter-modal");
  await typeByTestId(driver, "rate-converter-input", "12");
  await clickByTestId(driver, "rate-converter-to-monthly");
  await findByTestId(driver, "rate-converter-result");
  await waitForNormalizedText(driver, "taxa mensal");
  await clickByTestId(driver, "rate-converter-apply");
}

async function simulateRetirement(driver) {
  await openPage(driver, "/retirement-simulator", "retirement-simulation-page");
  await typeByTestId(driver, "retirement-desired-income", "4500,00");
  await typeByTestId(driver, "retirement-interest-rate", "9,50");
  await typeByTestId(driver, "retirement-period", "25");
  await setSelectByTestId(driver, "retirement-period-type", "ANNUAL");
  await setSelectByTestId(driver, "retirement-rate-type", "YEARLY");
  await typeByTestId(driver, "retirement-annual-inflation", "4,00");
  await typeByTestId(driver, "retirement-safe-withdrawal", "4,20");
  await clickByTestId(driver, "retirement-submit");
  await findByTestId(driver, "retirement-results");

  const contributionText = await getTextByTestId(
    driver,
    "retirement-result-monthly-contribution",
  );

  assert.ok(extractCurrency(contributionText) > 0);

  await clickByTestId(driver, "retirement-clear");
  await findByTestId(driver, "retirement-empty");
  await typeByTestId(driver, "retirement-interest-rate", "oito");
  await clickByTestId(driver, "retirement-submit");
  await waitForNormalizedText(driver, "renda mensal desejada");
  await waitForNormalizedText(driver, "taxa de juros deve ser um numero valido");
}

async function simulateReverse(driver) {
  await openPage(driver, "/reverse-simulation", "reverse-simulation-page");
  await typeByTestId(driver, "reverse-contribution-target-amount", "120000,00");
  await typeByTestId(driver, "reverse-contribution-interest-rate", "10,50");
  await typeByTestId(driver, "reverse-contribution-period", "8");
  await setSelectByTestId(driver, "reverse-contribution-period-type", "ANNUAL");
  await setSelectByTestId(driver, "reverse-contribution-rate-type", "YEARLY");
  await clickByTestId(driver, "reverse-contribution-submit");
  await findByTestId(driver, "reverse-results");

  const contributionHighlight = await getTextByTestId(
    driver,
    "reverse-result-highlight-contribution",
  );

  assert.ok(extractCurrency(contributionHighlight) > 0);

  await clickByTestId(driver, "reverse-contribution-clear");
  await findByTestId(driver, "reverse-empty");
  await typeByTestId(driver, "reverse-contribution-target-amount", "0");
  await typeByTestId(driver, "reverse-contribution-interest-rate", "0");
  await typeByTestId(driver, "reverse-contribution-period", "0");
  await clickByTestId(driver, "reverse-contribution-submit");
  await waitForNormalizedText(driver, "deve ser um valor maior que zero");
}

async function compareScenarios(driver) {
  await openPage(driver, "/scenario-comparison", "scenario-comparison-page");
  await typeByTestId(driver, "scenario-name-0", "Tesouro IPCA");
  await typeByTestId(driver, "scenario-initial-capital-0", "10000,00");
  await typeByTestId(driver, "scenario-monthly-contribution-0", "500,00");
  await typeByTestId(driver, "scenario-interest-rate-0", "0,75");
  await typeByTestId(driver, "scenario-months-0", "24");

  await typeByTestId(driver, "scenario-name-1", "Carteira arrojada");
  await typeByTestId(driver, "scenario-initial-capital-1", "10000,00");
  await typeByTestId(driver, "scenario-monthly-contribution-1", "500,00");
  await typeByTestId(driver, "scenario-interest-rate-1", "1,10");
  await typeByTestId(driver, "scenario-months-1", "24");

  await clickByTestId(driver, "scenario-submit");
  await findByTestId(driver, "scenario-result-table");
  await waitForNormalizedText(driver, "melhor cenario");

  const rows = await driver.findElements(By.css('[data-testid="scenario-result-row"]'));
  assert.equal(rows.length, 2);

  await clickByTestId(driver, "scenario-clear");
  await typeByTestId(driver, "scenario-name-0", "Plano conservador");
  await typeByTestId(driver, "scenario-initial-capital-0", "10000,00");
  await typeByTestId(driver, "scenario-monthly-contribution-0", "500,00");
  await typeByTestId(driver, "scenario-interest-rate-0", "0");
  await typeByTestId(driver, "scenario-months-0", "24");
  await clickByTestId(driver, "scenario-submit");
  await waitForNormalizedText(driver, "Taxa de juros deve ser maior que zero");
}

async function answerFinancialProfile(driver) {
  await openPage(driver, "/financial-profile", "financial-profile-page");
  await clickByTestId(driver, "financial-profile-open-questionnaire");
  await findByTestId(driver, "financial-profile-form");

  const answers = ["E", "D", "D", "E", "E", "E", "E", "E", "E", "E"];

  for (const [index, answer] of answers.entries()) {
    await clickByTestId(driver, `financial-profile-q${index + 1}-${answer}`);
  }

  await clickByTestId(driver, "financial-profile-submit");
  await findByTestId(driver, "financial-profile-current-result");

  const profileText = await getTextByTestId(driver, "financial-profile-current-profile");
  assert.equal(profileText, "Investidor");

  await clickByTestId(driver, "financial-profile-open-questionnaire");
  await findByTestId(driver, "financial-profile-form");
  await clickByTestId(driver, "financial-profile-reset");
  await clickByTestId(driver, "financial-profile-submit");
  await findByTestId(driver, "financial-profile-form");
}

async function validateSpendingLimit(driver) {
  await openPage(driver, "/spending-limit", "spending-limit-page");

  const createButtons = await driver.findElements(By.css('[data-testid="spending-limit-create"]'));
  assert.equal(
    createButtons.length,
    1,
    "Usuario e2e deve iniciar sem limite mensal configurado",
  );

  await clickElement(driver, createButtons[0]);
  await typeByTestId(driver, "spending-limit-amount", "0");
  await clickByTestId(driver, "spending-limit-submit");
  await waitForNormalizedText(driver, "O limite deve ser maior que zero");
  await clickByTestId(driver, "spending-limit-cancel");
  await waitForOpenModalToClose(driver);

  await clickByTestId(driver, "spending-limit-create");
  await typeByTestId(driver, "spending-limit-amount", "2500");
  await clickByTestId(driver, "spending-limit-submit");
  await waitForOpenModalToClose(driver);
  await findByTestId(driver, "spending-limit-card");
  assert.match(await getTextByTestId(driver, "spending-limit-value"), /2\.500,00/);

  const actionsButton = await findByTestId(driver, "spending-limit-actions");
  await clickElement(driver, actionsButton);
  await clickByTestId(driver, "spending-limit-edit");
  await typeByTestId(driver, "spending-limit-amount", "3200");
  await clickByTestId(driver, "spending-limit-submit");
  await waitForOpenModalToClose(driver);
  assert.match(await getTextByTestId(driver, "spending-limit-value"), /3\.200,00/);

  await clickByTestId(driver, "spending-limit-actions");
  await clickByTestId(driver, "spending-limit-delete");
  await findByTestId(driver, "spending-limit-delete-modal");
  await clickByTestId(driver, "spending-limit-delete-confirm");
  await findByTestId(driver, "spending-limit-empty");
}

async function validateProfileScenarios(driver) {
  await openPage(driver, "/profile", "profile-page");

  const updatedName = "Marina Costa Selenium";

  await clickByTestId(driver, "profile-edit");
  await typeByTestId(driver, "profile-name-input", updatedName);
  await clickByTestId(driver, "profile-save");

  await waitForNormalizedText(driver, "Nome do usuário atualizado com sucesso");
  assert.equal(await getTextByTestId(driver, "profile-card-name"), updatedName);

  await clickByTestId(driver, "profile-edit");
  await typeByTestId(driver, "profile-name-input", "Helena Temporaria");
  await clickByTestId(driver, "profile-cancel");
  assert.equal(await getTextByTestId(driver, "profile-card-name"), updatedName);

  await clickByTestId(driver, "profile-edit");
  await typeByTestId(driver, "profile-name-input", "   ");
  await clickByTestId(driver, "profile-save");

  await waitForNormalizedText(driver, "Informe um nome válido para atualizar");
}

async function validateRepeatedExpenses(driver, description) {
  await createTransaction(driver, {
    type: "EXPENSE",
    description,
    amount: "1800.00",
    date: "2026-03-05",
  });
  await createTransaction(driver, {
    type: "EXPENSE",
    description,
    amount: "1800.00",
    date: "2026-04-05",
  });
  await createTransaction(driver, {
    type: "EXPENSE",
    description,
    amount: "1800.00",
    date: "2026-05-05",
  });

  await openPage(driver, "/repeated-expenses", "repeated-expenses-page");
  await findByTestId(driver, "repeated-expenses-table-card");

  const rows = await driver.findElements(By.css('[data-testid="repeated-expense-row"]'));
  let repeatedExpenseText = "";

  for (const row of rows) {
    const text = await row.getText();
    if (normalizeText(text).includes(normalizeText(description))) {
      repeatedExpenseText = normalizeText(text);
      break;
    }
  }

  assert.ok(repeatedExpenseText, `Gasto recorrente nao encontrado: ${description}`);
  assert.match(repeatedExpenseText, /r\$\s*1\.800,00/);
  assert.match(repeatedExpenseText, /em 3 mes\(es\)/);
}

test("jornada integrada Selenium com MySQL em um unico login", async () => {
  const driver = await createDriver();

  try {
    await showAboutPage(driver);

    await simulateCompoundInterest(driver);
    await useRateConverter(driver);

    await loginOnce(driver);

    await findByTestId(driver, "dashboard-page");
    await waitForNormalizedText(driver, "dashboard");

    await validateTransactionScenarios(driver);

    const date = "2026-05-10";
    const incomeDescription = "Salario mensal maio 2026";
    const expenseDescription = "Supermercado maio 2026";

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

    await openPage(driver, "/dashboard", "dashboard-page");

    const incomeCard = await getTextByTestId(driver, "dashboard-income-card");
    const expenseCard = await getTextByTestId(driver, "dashboard-expense-card");
    const recentTransactions = await getTextByTestId(
      driver,
      "dashboard-recent-transactions",
    );

    assert.match(incomeCard, /Receitas/i);
    assert.match(expenseCard, /Despesas/i);
    assert.match(recentTransactions, new RegExp(incomeDescription));
    assert.match(recentTransactions, new RegExp(expenseDescription));

    await validateRepeatedExpenses(driver, "Aluguel residencial");
    await validateSpendingLimit(driver);

    await validateTwoGoalsAndDeleteOne(driver);

    await simulateRetirement(driver);
    await simulateReverse(driver);
    await compareScenarios(driver);
    await answerFinancialProfile(driver);
    await validateProfileScenarios(driver);

    const modalCloseButtons = await driver.findElements(By.css(".modal.show .btn-close"));
    if (modalCloseButtons.length > 0) {
      await modalCloseButtons[0].click();
      await driver.wait(until.stalenessOf(modalCloseButtons[0]), 10000);
    }
  } finally {
    await driver.quit();
    await cleanupLoggedE2eUser();
  }
});
