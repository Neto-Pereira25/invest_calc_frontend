import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder, By, until } = selenium;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
const TEST_PAUSE_MS = Number(process.env.SELENIUM_TEST_PAUSE_MS ?? 500);

let driver;

async function createDriver() {
  const options = new chrome.Options();

  if (process.env.SELENIUM_HEADLESS === "true" || process.env.CI === "true") {
    options.addArguments("--headless=new");
  }

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

async function openSimulationPage(driver) {
  await driver.get(`${FRONTEND_URL}/compound-interest-simulator`);
  await clearStorage(driver);
  await waitForPath(driver, "/compound-interest-simulator");
}

async function openConverter(driver) {
  await clickByTestId(driver, "open-rate-converter");
  await findByTestId(driver, "rate-converter-modal");
}

async function getResultText(driver) {
  const result = await findByTestId(driver, "rate-converter-result");
  return result.getText();
}

describe("conversor de taxa de juros", () => {
  before(async () => {
    driver = await createDriver();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test("deve converter taxas anuais realistas para taxas mensais equivalentes", async () => {
    await openSimulationPage(driver);
    await openConverter(driver);

    await typeByTestId(driver, "rate-converter-input", "12");

    let resultText = await getResultText(driver);
    assert.match(resultText, /Taxa Mensal Equivalente/i);
    assert.match(resultText, /0,9489%/);
    assert.match(resultText, /a\.m\./);

    await typeByTestId(driver, "rate-converter-input", "13.75");

    resultText = await getResultText(driver);
    assert.match(resultText, /1,079%/);
    assert.match(resultText, /a\.m\./);

    const formulaText = await (await findByTestId(driver, "rate-converter-formula")).getText();
    assert.match(formulaText, /\(1 \+ 13\.7500%\)\^\(1\/12\) - 1/);
  });

  test("deve converter taxa mensal para taxa anual equivalente", async () => {
    await clickByTestId(driver, "rate-converter-to-yearly");
    await typeByTestId(driver, "rate-converter-input", "1");

    let resultText = await getResultText(driver);
    assert.match(resultText, /Taxa Anual Equivalente/i);
    assert.match(resultText, /12,683%/);
    assert.match(resultText, /a\.a\./);

    await typeByTestId(driver, "rate-converter-input", "0.8");

    resultText = await getResultText(driver);
    assert.match(resultText, /10,034%/);
    assert.match(resultText, /a\.a\./);
  });

  test("deve aplicar taxa convertida na simulacao", async () => {
    await clickByTestId(driver, "rate-converter-to-monthly");
    await typeByTestId(driver, "rate-converter-input", "12");
    await clickByTestId(driver, "rate-converter-apply");

    const rateInput = await findByTestId(driver, "simulation-interest-rate");
    const rateType = await findByTestId(driver, "simulation-rate-type");

    assert.equal(await rateInput.getAttribute("value"), "0,95");
    assert.equal(await rateType.getAttribute("value"), "MONTHLY");
  });

  test("deve converter taxa zero sem gerar juros equivalentes", async () => {
    await openConverter(driver);
    await typeByTestId(driver, "rate-converter-input", "0");

    const resultText = await getResultText(driver);
    assert.match(resultText, /0,00%/);
  });
});
