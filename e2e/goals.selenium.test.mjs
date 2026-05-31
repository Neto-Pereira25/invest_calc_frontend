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
  }, 10000);
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

function uniqueShortSuffix() {
  return Date.now().toString().slice(-5);
}

function uniqueEmail(name) {
  const suffix = uniqueShortSuffix();
  return `${name}${suffix}@email.com`;
}

function uniqueGoalName(name) {
  return `${name} ${uniqueShortSuffix()}`;
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

  const email = uniqueEmail("ana.costa");
  const password = "12345678";

  await registerUserByUi(driver, {
    name: "Ana Beatriz Costa",
    email,
    password,
  });

  await typeByTestId(driver, "login-email", email);
  await typeByTestId(driver, "login-password", password);
  await clickByTestId(driver, "login-submit");
  await waitForPath(driver, "/dashboard");
  await sleep(driver);
}

async function openGoalsPage(driver) {
  await driver.get(`${FRONTEND_URL}/goals`);
  await waitForPath(driver, "/goals");
  await sleep(driver);
}

async function waitForGoal(driver, goalName) {
  try {
    await driver.wait(async () => {
      const cards = await driver.findElements(By.css('[data-testid="goal-card"]'));

      for (const card of cards) {
        const text = await card.getText();
        if (text.includes(goalName)) {
          return true;
        }
      }

      return false;
    }, 10000);
  } catch (error) {
    const bodyText = await driver.executeScript("return document.body?.innerText ?? '';");

    throw new Error(
      `Nao encontrou a meta "${goalName}". Texto atual: ${bodyText.slice(0, 800)}`,
      { cause: error },
    );
  }
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

async function createGoal(driver, { name, targetAmount, deadline }) {
  await clickByTestId(driver, "goal-new");
  await typeByTestId(driver, "goal-name", name);
  await typeByTestId(driver, "goal-target-amount", targetAmount);
  await setValueByTestId(driver, "goal-deadline", deadline);
  await clickByTestId(driver, "goal-submit");
  await waitForGoal(driver, name);
}

async function updateGoalProgress(driver, goalName, currentAmount) {
  const card = await findGoalCard(driver, goalName);
  const actionsButton = await card.findElement(By.css('[data-testid="goal-actions"]'));

  await actionsButton.click();
  await sleep(driver);

  await clickByTestId(driver, "goal-update-progress");
  await typeByTestId(driver, "goal-current-amount", currentAmount);
  await clickByTestId(driver, "goal-progress-submit");
  await sleep(driver);
}

test("deve criar meta financeira e atualizar progresso", async () => {
  const driver = await createDriver();

  try {
    await loginAsNewUser(driver);
    await openGoalsPage(driver);

    const goalName = uniqueGoalName("Viagem para Recife");

    await createGoal(driver, {
      name: goalName,
      targetAmount: "8500",
      deadline: "2026-11-20",
    });

    let card = await findGoalCard(driver, goalName);
    let cardText = await card.getText();

    assert.match(cardText, /R\$\s*0,00/);
    assert.match(cardText, /R\$\s*8\.500,00/);
    assert.match(cardText, /0%/);

    await updateGoalProgress(driver, goalName, "2125");

    card = await findGoalCard(driver, goalName);
    cardText = await card.getText();

    assert.match(cardText, /R\$\s*2\.125,00/);
    assert.match(cardText, /R\$\s*8\.500,00/);
    assert.match(cardText, /25%/);
  } finally {
    await driver.quit();
  }
});
