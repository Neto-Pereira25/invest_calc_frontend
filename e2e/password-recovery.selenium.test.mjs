import test from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder, By, until } = selenium;

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8080/api/v1";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";

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

async function getAuthStorage(driver) {
  return driver.executeScript(
    `return window.localStorage.getItem('auth-storage');`,
  );
}

async function waitForText(driver, expectedText, timeout = 10000) {
  await driver.wait(async () => {
    const text = await driver.executeScript(`
      return document.body?.innerText ?? '';
    `);

    return text.includes(expectedText);
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

async function typeByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await driver.sleep(900);
}

async function clickByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);

  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    element,
  );

  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(until.elementIsEnabled(element), 10000);

  await element.click();
  await driver.sleep(900);
}

async function clickLinkByText(driver, text) {
  const link = await driver.wait(
    until.elementLocated(
      By.xpath(`//a[contains(normalize-space(.), "${text}")]`),
    ),
    10000,
  );

  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    link,
  );

  await driver.wait(until.elementIsVisible(link), 10000);
  await driver.wait(until.elementIsEnabled(link), 10000);

  await link.click();
  await driver.sleep(900);
}

async function registerUserByUi(driver, { name, email, password }) {
  await driver.get(`${FRONTEND_URL}/register`);

  await typeByTestId(driver, "register-name", name);
  await typeByTestId(driver, "register-email", email);
  await typeByTestId(driver, "register-password", password);
  await typeByTestId(driver, "register-confirm-password", password);
  await clickByTestId(driver, "register-submit");

  await waitForPath(driver, "/login");
}

function uniqueEmail() {
  return `reset.e2e.${Date.now()}.${Math.random().toString(36).slice(2)}@email.com`;
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(
      `Falha em ${method} ${path}: status ${response.status} - ${JSON.stringify(data)}`,
    );
  }

  return data;
}

test("deve recuperar senha no fluxo e2e e autenticar com nova senha", async () => {
  const driver = await createDriver();
  const email = uniqueEmail();
  const initialPassword = "12345678";
  const newPassword = "87654321";

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    await registerUserByUi(driver, {
      name: "Reset E2E User",
      email,
      password: initialPassword,
    });

    await driver.get(`${FRONTEND_URL}/login`);
    await clickLinkByText(driver, "Esqueci minha senha");
    await waitForPath(driver, "/forgot-password");

    await typeByTestId(driver, "forgot-password-email", email);
    await clickByTestId(driver, "forgot-password-submit");
    await waitForPath(driver, "/reset-password");

    const tokenResponse = await apiRequest(
      `/auth/e2e/password-reset-token?email=${encodeURIComponent(email)}`,
    );
    const token = tokenResponse?.data?.token;

    assert.ok(token, "Token de reset deve existir");

    await driver.get(`${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`);
    await typeByTestId(driver, "reset-password-new-password", newPassword);
    await typeByTestId(driver, "reset-password-confirm-password", newPassword);
    await clickByTestId(driver, "reset-password-submit");
    await waitForPath(driver, "/");

    await typeByTestId(driver, "login-email", email);
    await typeByTestId(driver, "login-password", newPassword);
    await clickByTestId(driver, "login-submit");
    await waitForPath(driver, "/dashboard");

    const authStorage = await getAuthStorage(driver);
    assert.match(authStorage, /token/);
    assert.match(authStorage, /refreshToken/);
  } finally {
    await driver.quit();
  }
});

test("deve exibir validacao ao informar e-mail invalido no forgot password", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/forgot-password`);
    await clearStorage(driver);

    await typeByTestId(driver, "forgot-password-email", "email-invalido");
    await clickByTestId(driver, "forgot-password-submit");

    await waitForText(driver, "E-mail inválido");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/forgot-password");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro quando confirmacao de senha for diferente no reset", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/reset-password?token=token-fake`);
    await clearStorage(driver);

    await typeByTestId(driver, "reset-password-new-password", "12345678");
    await typeByTestId(driver, "reset-password-confirm-password", "87654321");
    await clickByTestId(driver, "reset-password-submit");

    await waitForText(driver, "As senhas não coincidem");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/reset-password");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar resetar com token invalido", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/reset-password?token=token-invalido`);
    await clearStorage(driver);

    await typeByTestId(driver, "reset-password-new-password", "12345678");
    await typeByTestId(driver, "reset-password-confirm-password", "12345678");
    await clickByTestId(driver, "reset-password-submit");

    await waitForText(driver, "Não foi possível redefinir a senha. Verifique o token e tente novamente.");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/reset-password");
  } finally {
    await driver.quit();
  }
});