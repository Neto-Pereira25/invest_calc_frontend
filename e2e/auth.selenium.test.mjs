import test from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder, By, until } = selenium;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";

async function createDriver() {
  const options = new chrome.Options();

  // options.addArguments('--headless=new');
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
  try {
    await driver.wait(async () => {
      const path = await getCurrentPath(driver);
      return path === expectedPath;
    }, 10000);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    const visibleErrors = await driver.executeScript(`
            return Array.from(document.querySelectorAll('[data-testid$="-error"]'))
                .filter((element) => element.offsetParent !== null)
                .map((element) => element.textContent?.trim())
                .filter(Boolean);
        `);

    throw new Error(
      `Esperava navegar para "${expectedPath}", mas a URL atual e "${currentUrl}". ` +
        `Erros visiveis: ${visibleErrors.join(" | ") || "nenhum"}`,
      { cause: error },
    );
  }
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
  await driver.sleep(1200);
}

async function clickByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);

  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    element,
  );

  await driver.sleep(1200);

  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(until.elementIsEnabled(element), 10000);

  await element.click();
  await driver.sleep(1200);
}

async function scrollToElement(driver, element) {
  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
    element,
  );
}

function uniqueEmail() {
  return `selenium.${Date.now()}.${Math.random().toString(36).slice(2)}@email.com`;
}

async function registerUserByUi(driver, { name, email, password }) {
  await driver.get(`${FRONTEND_URL}/register`);

  await typeByTestId(driver, "register-name", name);
  await typeByTestId(driver, "register-email", email);
  await typeByTestId(driver, "register-password", password);
  await typeByTestId(driver, "register-confirm-password", password);

  await clickByTestId(driver, "register-submit");

  await driver.sleep(2000);

  await waitForPath(driver, "/");
  await driver.sleep(2000);

}

test("deve cadastrar usuário e fazer login com sucesso", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    const email = uniqueEmail();
    const password = "12345678";

    await registerUserByUi(driver, {
      name: "Maria Helena",
      email,
      password,
    });

    await typeByTestId(driver, "login-email", email);
    await typeByTestId(driver, "login-password", password);

    await clickByTestId(driver, "login-submit");

    await waitForPath(driver, "/dashboard");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/dashboard");

    const authStorage = await driver.executeScript(
      `return window.localStorage.getItem('auth-storage');`,
    );

    assert.match(authStorage, /token/);
    assert.match(authStorage, /refreshToken/);
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar login com senha inválida", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    const email = uniqueEmail();
    const password = "12345678";

    await registerUserByUi(driver, {
      name: "João Selenium",
      email,
      password,
    });

    await typeByTestId(driver, "login-email", email);
    await typeByTestId(driver, "login-password", "senhaErrada");

    await clickByTestId(driver, "login-submit");

    const error = await findByTestId(driver, "login-error");
    const errorText = await error.getText();

    assert.equal(errorText, "E-mail ou senha inválidos");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar cadastrar com senhas diferentes", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/register`);
    await clearStorage(driver);

    await typeByTestId(driver, "register-name", "Teste Selenium");
    await typeByTestId(driver, "register-email", uniqueEmail());
    await typeByTestId(driver, "register-password", "12345678");
    await typeByTestId(driver, "register-confirm-password", "87654321");

    await clickByTestId(driver, "register-submit");

    const error = await findByTestId(driver, "register-error");
    await scrollToElement(driver, error);
    const errorText = await error.getText();

    assert.equal(errorText, "As senhas não coincidem");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/register");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar cadastrar com nome muito curto", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/register`);
    await clearStorage(driver);

    await typeByTestId(driver, "register-name", "AB");
    await typeByTestId(driver, "register-email", uniqueEmail());
    await typeByTestId(driver, "register-password", "12345678");
    await typeByTestId(driver, "register-confirm-password", "12345678");

    await clickByTestId(driver, "register-submit");

    const error = await findByTestId(driver, "register-error");
    await scrollToElement(driver, error);
    const errorText = await error.getText();

    assert.equal(errorText, "Nome deve ter pelo menos 3 caracteres");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/register");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar cadastrar com e-mail inválido", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/register`);
    await clearStorage(driver);

    await typeByTestId(driver, "register-name", "Teste Selenium");
    await typeByTestId(driver, "register-email", "email-invalido");
    await typeByTestId(driver, "register-password", "12345678");
    await typeByTestId(driver, "register-confirm-password", "12345678");

    await clickByTestId(driver, "register-submit");

    const error = await findByTestId(driver, "register-error");
    await scrollToElement(driver, error);
    const errorText = await error.getText();

    assert.equal(errorText, "E-mail inválido");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/register");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar cadastrar com senha menor que 8 caracteres", async () => {
  const driver = await createDriver();

  try {
    await driver.get(`${FRONTEND_URL}/register`);
    await clearStorage(driver);

    await typeByTestId(driver, "register-name", "Teste Selenium");
    await typeByTestId(driver, "register-email", uniqueEmail());
    await typeByTestId(driver, "register-password", "1234567");
    await typeByTestId(driver, "register-confirm-password", "1234567");

    await clickByTestId(driver, "register-submit");

    const error = await findByTestId(driver, "register-error");
    await scrollToElement(driver, error);
    const errorText = await error.getText();

    assert.equal(errorText, "Senha deve ter no mínimo 8 caracteres");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/register");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar login com e-mail inválido", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    await typeByTestId(driver, "login-email", "email-invalido");
    await typeByTestId(driver, "login-password", "12345678");

    await clickByTestId(driver, "login-submit");

    const error = await findByTestId(driver, "login-error");
    const errorText = await error.getText();

    assert.equal(errorText, "E-mail inválido");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar login com senha vazia", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    await typeByTestId(driver, "login-email", uniqueEmail());

    await clickByTestId(driver, "login-submit");

    const error = await findByTestId(driver, "login-error");
    const errorText = await error.getText();

    assert.equal(errorText, "Senha obrigatória");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar login com e-mail não cadastrado", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    await typeByTestId(driver, "login-email", uniqueEmail());
    await typeByTestId(driver, "login-password", "12345678");

    await clickByTestId(driver, "login-submit");

    const error = await findByTestId(driver, "login-error");
    const errorText = await error.getText();

    assert.equal(errorText, "E-mail ou senha inválidos");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/");
  } finally {
    await driver.quit();
  }
});
