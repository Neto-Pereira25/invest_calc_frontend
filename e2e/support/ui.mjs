import selenium from "selenium-webdriver";
import select from "selenium-webdriver/lib/select.js";
import { TEST_PAUSE_MS } from "./config.mjs";

export const { By, until } = selenium;
export const { Select } = select;

export async function sleep(driver, ms = TEST_PAUSE_MS) {
  if (ms > 0) {
    await driver.sleep(ms);
  }
}

export async function clearStorage(driver) {
  await driver.executeScript(`
    window.localStorage.clear();
    window.sessionStorage.clear();
  `);
}

export async function getCurrentPath(driver) {
  const currentUrl = await driver.getCurrentUrl();
  return new URL(currentUrl).pathname;
}

export async function waitForPath(driver, expectedPath, timeout = 10000) {
  await driver.wait(async () => {
    const path = await getCurrentPath(driver);
    return path === expectedPath;
  }, timeout, `Caminho esperado nao atingido: ${expectedPath}`);
}

export async function findByTestId(driver, testId, timeout = 10000) {
  const selector = `[data-testid="${testId}"]`;
  const element = await driver.wait(until.elementLocated(By.css(selector)), timeout);

  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);

  return element;
}

export async function typeByTestId(driver, testId, value) {
  const element = await findByTestId(driver, testId);
  await element.clear();
  await element.sendKeys(value);
  await sleep(driver);
}

export async function setValueByTestId(driver, testId, value) {
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

export async function clickElement(driver, element) {
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

export async function clickByTestId(driver, testId) {
  const element = await findByTestId(driver, testId);
  await clickElement(driver, element);
}

export async function waitForOptions(driver, testId) {
  const selectElement = await findByTestId(driver, testId);

  await driver.wait(async () => {
    const count = await driver.executeScript(
      "return Array.from(arguments[0].querySelectorAll('option[value]')).filter((item) => !['', '0'].includes(item.value)).length;",
      selectElement,
    );

    return count > 0;
  }, 10000, `Opcoes do select ${testId} nao carregaram`);

  return selectElement;
}

export async function selectFirstRealOption(driver, testId) {
  const selectElement = await waitForOptions(driver, testId);
  const firstValue = await driver.executeScript(
    "return Array.from(arguments[0].options).find((item) => !['', '0'].includes(item.value))?.value;",
    selectElement,
  );

  const selectObject = new Select(selectElement);
  await selectObject.selectByValue(firstValue);
  await sleep(driver);
}
