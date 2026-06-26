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

async function waitForText(driver, expectedText, timeout = 10000) {
  await driver.wait(async () => {
    const text = await driver.executeScript(`
      return document.body?.innerText ?? '';
    `);

    return text.includes(expectedText);
  }, timeout, `Texto nao encontrado: ${expectedText}`);
}

async function openAboutPage(driver) {
  await driver.get(FRONTEND_URL);
  await clearStorage(driver);
  await driver.get(`${FRONTEND_URL}/about`);
  await waitForPath(driver, "/about");
  await sleep(driver);
}

test("deve exibir conteudo institucional da pagina sobre", async () => {
  const driver = await createDriver();

  try {
    await openAboutPage(driver);

    await waitForText(driver, "Sobre o InvestCalc");
    await waitForText(driver, "Apresentação do Projeto");
    await waitForText(driver, "Principais Funcionalidades");
    await waitForText(driver, "Tecnologias Utilizadas");
    await waitForText(driver, "Equipe Desenvolvedora");
    await waitForText(driver, "Diferenciais");

    await waitForText(driver, "Dashboard Financeiro");
    await waitForText(driver, "React");
    await waitForText(driver, "Spring Boot");
    await waitForText(driver, "Autenticação JWT");
    await waitForText(driver, "InvestCalc v1.0");
    await waitForText(driver, "Sprint 3");

    const sectionTitles = await driver.findElements(By.css("h2"));
    assert.ok(
      sectionTitles.length >= 9,
      "A pagina Sobre deve renderizar as secoes institucionais principais",
    );

    await sleep(driver);
  } finally {
    await driver.quit();
  }
});

test("deve carregar cards, fotos e links da equipe desenvolvedora", async () => {
  const driver = await createDriver();

  try {
    await openAboutPage(driver);

    const expectedMembers = [
      "Ana Letícia",
      "David Esdras",
      "Emilly Maria",
      "José Neto",
      "Maria Helena",
    ];

    for (const member of expectedMembers) {
      await waitForText(driver, member);
    }

    await sleep(driver);

    const avatarStatus = await driver.executeScript(`
      return Array.from(document.querySelectorAll('img[alt]')).map((image) => ({
        alt: image.getAttribute('alt'),
        complete: image.complete,
        naturalWidth: image.naturalWidth,
      }));
    `);

    assert.equal(
      avatarStatus.length,
      expectedMembers.length,
      "A pagina deve exibir uma foto para cada integrante",
    );

    for (const avatar of avatarStatus) {
      assert.ok(expectedMembers.includes(avatar.alt), `Foto inesperada: ${avatar.alt}`);
      assert.equal(avatar.complete, true, `A foto de ${avatar.alt} deve terminar de carregar`);
      assert.ok(avatar.naturalWidth > 0, `A foto de ${avatar.alt} deve ter largura valida`);
    }

    const mariaGithub = await driver.wait(
      until.elementLocated(By.css('a[aria-label="Perfil do GitHub de Maria Helena"]')),
      10000,
    );
    const mariaLinkedin = await driver.wait(
      until.elementLocated(By.css('a[aria-label="Perfil do LinkedIn de Maria Helena"]')),
      10000,
    );
    const mariaEmail = await driver.wait(
      until.elementLocated(By.css('a[aria-label="Enviar e-mail para Maria Helena"]')),
      10000,
    );

    assert.match(await mariaGithub.getAttribute("href"), /github\.com\/HelenaSilva0/);
    assert.match(await mariaLinkedin.getAttribute("href"), /linkedin\.com\/in\/maria-helena/);
    assert.equal(await mariaEmail.getAttribute("href"), "mailto:mh14s@discente.ifpe.edu.br");

    await sleep(driver);
  } finally {
    await driver.quit();
  }
});
