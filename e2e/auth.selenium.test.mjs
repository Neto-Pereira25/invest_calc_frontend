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
    const pageText = await driver.executeScript(`
      return document.body?.innerText ?? '';
    `);

    throw new Error(
      `Esperava navegar para "${expectedPath}", mas a URL atual e "${currentUrl}". ` +
      `Texto atual da pagina: ${pageText.slice(0, 500) || "nenhum"}`,
      { cause: error },
    );
  }
}

async function waitForText(driver, expectedText, timeout = 10000) {
  await driver.wait(async () => {
    const text = await driver.executeScript(`
      return document.body?.innerText ?? '';
    `);

    return text.includes(expectedText);
  }, timeout, `Texto nao encontrado: ${expectedText}`);
}

async function getAuthStorage(driver) {
  return driver.executeScript(
    `return window.localStorage.getItem('auth-storage');`,
  );
}

function assertPathIn(path, expectedPaths) {
  assert.ok(
    expectedPaths.includes(path),
    `Caminho inesperado: ${path}. Esperado um destes: ${expectedPaths.join(', ')}`,
  );
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

  await waitForPath(driver, "/login");
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

    const authStorage = await getAuthStorage(driver);

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

    await driver.sleep(2000);

    const path = await getCurrentPath(driver);
    assertPathIn(path, ["/", "/login"]);

    const authStorage = await getAuthStorage(driver);
    assert.ok(!authStorage || !authStorage.includes("token"));
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

    await waitForText(driver, "As senhas não coincidem");

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

    await waitForText(driver, "Nome deve ter pelo menos 3 caracteres");

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

    await waitForText(driver, "E-mail inválido");

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

    await waitForText(driver, "Senha deve ter no mínimo 8 caracteres");

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

    await waitForText(driver, "E-mail inválido");

    const path = await getCurrentPath(driver);
    assert.equal(path, "/");
  } finally {
    await driver.quit();
  }
});

test("deve exibir erro ao tentar login com senha menor que 8 caracteres", async () => {
  const driver = await createDriver();

  try {
    await driver.get(FRONTEND_URL);
    await clearStorage(driver);

    await typeByTestId(driver, "login-email", uniqueEmail());

    await clickByTestId(driver, "login-submit");

    await waitForText(driver, "A senha deve possuir pelo menos 8 caracteres");

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

    await driver.sleep(2000);

    const path = await getCurrentPath(driver);
    assertPathIn(path, ["/", "/login"]);

    const authStorage = await getAuthStorage(driver);
    assert.ok(!authStorage || !authStorage.includes("token"));
  } finally {
    await driver.quit();
  }
});
