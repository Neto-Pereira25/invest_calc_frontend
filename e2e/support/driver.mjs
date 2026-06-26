import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Builder } = selenium;

export async function createDriver() {
  const options = new chrome.Options();

  if (process.env.SELENIUM_HEADLESS === "true") {
    options.addArguments("--headless=new");
  }

  options.addArguments("--window-size=1366,1000");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}
