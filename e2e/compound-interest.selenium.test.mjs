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

    await driver.executeScript(
        'arguments[0].scrollIntoView({ block: "center", inline: "center" });',
        button,
    );

    await driver.wait(until.elementIsVisible(button), 10000);
    await driver.wait(until.elementIsEnabled(button), 10000);
    await button.click();
    await sleep(driver);
}

function normalizeText(value) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

async function getBodyText(driver) {
    return driver.executeScript("return document.body?.innerText ?? ''; ");
}

async function waitForNormalizedText(driver, expected, timeout = 10000) {
    const normalizedExpected = normalizeText(expected);

    await driver.wait(async () => {
        const bodyText = await getBodyText(driver);
        const normalizedBody = normalizeText(bodyText);
        return normalizedBody.includes(normalizedExpected);
    }, timeout, `Texto nao encontrado: ${expected}`);
}

async function waitForAnyNormalizedText(driver, expectedList, timeout = 10000) {
    const normalizedExpectedList = expectedList.map((item) => normalizeText(item));

    await driver.wait(async () => {
        const bodyText = await getBodyText(driver);
        const normalizedBody = normalizeText(bodyText);

        return normalizedExpectedList.some((item) => normalizedBody.includes(item));
    }, timeout, `Nenhum dos textos esperados foi encontrado: ${expectedList.join(" | ")}`);
}

function parseBRLCurrency(value) {
    const sanitized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    return Number(sanitized);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCurrencyByLabel(bodyText, label) {
    const regex = new RegExp(`${escapeRegExp(label)}\\s*R\\$\\s*([\\d.]+,\\d{2})`, "i");
    const match = bodyText.match(regex);

    assert.ok(match, `Nao foi possivel encontrar o valor para o rotulo: ${label}`);
    return parseBRLCurrency(match[1]);
}

async function openSimulationPage(driver) {
    await driver.get(`${FRONTEND_URL}/compound-interest-simulator`);
    await clearStorage(driver);
    await waitForPath(driver, "/compound-interest-simulator");
}

async function fillSimulationForm(driver, {
    initialValue,
    interestRate,
    period,
    monthlyContribution,
    periodType,
    rateType,
}) {
    if (initialValue !== undefined) {
        await typeByTestId(driver, "simulation-initial-value", String(initialValue));
    }

    if (interestRate !== undefined) {
        await typeByTestId(driver, "simulation-interest-rate", String(interestRate));
    }

    if (period !== undefined) {
        await typeByTestId(driver, "simulation-period", String(period));
    }

    if (monthlyContribution !== undefined) {
        await typeByTestId(driver, "simulation-monthly-contribution", String(monthlyContribution));
    }

    if (periodType !== undefined) {
        await setSelectByTestId(driver, "simulation-period-type", periodType);
    }

    if (rateType !== undefined) {
        await setSelectByTestId(driver, "simulation-rate-type", rateType);
    }
}

async function submitSimulation(driver) {
    await clickButtonByText(driver, "Calcular");
}

test("deve calcular simulacao e exibir resultado, grafico e tabela", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await fillSimulationForm(driver, {
            initialValue: "20000",
            interestRate: "12",
            period: "2",
            monthlyContribution: "1000",
            periodType: "ANNUAL",
            rateType: "YEARLY",
        });

        await submitSimulation(driver);

        await waitForNormalizedText(driver, "resultado", 20000);
        await waitForNormalizedText(driver, "valor total final", 20000);

        const rows = await driver.findElements(By.css("table tbody tr"));
        assert.ok(rows.length > 0, "A tabela da simulacao deve ter ao menos uma linha");

        let bodyText = await getBodyText(driver);
        assert.match(bodyText, /R\$/);

        const totalInterest = extractCurrencyByLabel(bodyText, "Total em Juros");
        const totalInvested = extractCurrencyByLabel(bodyText, "Valor Total Investido");
        const finalAmount = extractCurrencyByLabel(bodyText, "Valor Total Final");

        const delta = Math.abs((totalInterest + totalInvested) - finalAmount);
        assert.ok(delta <= 0.01, "Valor final deve ser consistente com investido + juros");

        await fillSimulationForm(driver, {
            initialValue: "5000",
            interestRate: "6",
            period: "18",
            monthlyContribution: "300",
            periodType: "MONTHLY",
            rateType: "MONTHLY",
        });

        await submitSimulation(driver);
        await waitForNormalizedText(driver, "valor total final", 20000);

        bodyText = await getBodyText(driver);
        const recalculatedFinalAmount = extractCurrencyByLabel(bodyText, "Valor Total Final");

        assert.notEqual(finalAmount, recalculatedFinalAmount, "O resultado deve atualizar ao recalcular sem limpar");

        await clickButtonByText(driver, "Limpar");

        await driver.wait(async () => {
            const text = await getBodyText(driver);
            return !normalizeText(text).includes("valor total final");
        }, 10000);
    } finally {
        await driver.quit();
    }
});

test("deve exibir validacoes quando campos obrigatorios nao forem preenchidos", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await submitSimulation(driver);

        await waitForNormalizedText(driver, "valor inicial e obrigatorio");
        await waitForNormalizedText(driver, "taxa de juros e obrigatoria");
        await waitForNormalizedText(driver, "periodo e obrigatorio");
        await waitForNormalizedText(driver, "aporte mensal e obrigatorio");
    } finally {
        await driver.quit();
    }
});

test("deve validar limites de zero e negativos e aceitar zero quando permitido", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await fillSimulationForm(driver, {
            initialValue: "0",
            interestRate: "-1",
            period: "0",
            monthlyContribution: "-1",
        });

        await submitSimulation(driver);

        await waitForNormalizedText(driver, "valor inicial deve ser maior que zero");
        await waitForNormalizedText(driver, "taxa de juros deve ser maior ou igual a zero");
        await waitForNormalizedText(driver, "periodo deve ser maior que zero");
        await waitForNormalizedText(driver, "aporte mensal deve ser maior ou igual a zero");

        await clickButtonByText(driver, "Limpar");

        await fillSimulationForm(driver, {
            initialValue: "1000",
            interestRate: "0",
            period: "12",
            monthlyContribution: "0",
        });

        await submitSimulation(driver);
        await waitForAnyNormalizedText(
            driver,
            ["valor total final", "ocorreu um erro ao realizar a simulacao"],
            20000,
        );

        const text = normalizeText(await getBodyText(driver));
        assert.ok(!text.includes("taxa de juros deve ser maior ou igual a zero"));
        assert.ok(!text.includes("aporte mensal deve ser maior ou igual a zero"));
    } finally {
        await driver.quit();
    }
});

test("deve aceitar formatos numericos locais comuns", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await fillSimulationForm(driver, {
            initialValue: "20.000,50",
            interestRate: "12,5",
            period: "24",
            monthlyContribution: "1.000,25",
        });

        await submitSimulation(driver);
        await waitForNormalizedText(driver, "valor total final", 20000);

        await clickButtonByText(driver, "Limpar");

        await fillSimulationForm(driver, {
            initialValue: "20000.50",
            interestRate: "12.5",
            period: "24",
            monthlyContribution: "1000.25",
        });

        await submitSimulation(driver);
        await waitForNormalizedText(driver, "valor total final", 20000);

        await clickButtonByText(driver, "Limpar");

        await fillSimulationForm(driver, {
            initialValue: "20,000.50",
            interestRate: "12,5",
            period: "24",
            monthlyContribution: "1,000.25",
        });

        await submitSimulation(driver);
        await waitForNormalizedText(driver, "valor total final", 20000);
    } finally {
        await driver.quit();
    }
});

test("deve exibir mensagens de campo invalido para entradas nao numericas", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await fillSimulationForm(driver, {
            initialValue: "abc",
            interestRate: "xyz",
            period: "um",
            monthlyContribution: "valor",
        });

        await submitSimulation(driver);

        await waitForNormalizedText(driver, "valor inicial deve ser um numero");
        await waitForNormalizedText(driver, "taxa de juros deve ser um numero");
        await waitForNormalizedText(driver, "periodo deve ser um numero");
        await waitForNormalizedText(driver, "aporte mensal deve ser um numero");
    } finally {
        await driver.quit();
    }
});

test("deve calcular com todas as combinacoes de tipo de taxa e periodo", async () => {
    const driver = await createDriver();

    const combinations = [
        { rateType: "YEARLY", periodType: "ANNUAL" },
        { rateType: "YEARLY", periodType: "MONTHLY" },
        { rateType: "MONTHLY", periodType: "ANNUAL" },
        { rateType: "MONTHLY", periodType: "MONTHLY" },
    ];

    try {
        await openSimulationPage(driver);

        for (const combination of combinations) {
            await clickButtonByText(driver, "Limpar");

            await fillSimulationForm(driver, {
                initialValue: "15000",
                interestRate: "8",
                period: "12",
                monthlyContribution: "500",
                periodType: combination.periodType,
                rateType: combination.rateType,
            });

            await submitSimulation(driver);
            await waitForNormalizedText(driver, "valor total final", 20000);
        }
    } finally {
        await driver.quit();
    }
});

test("deve exibir erro quando a API de simulacao falhar", async () => {
    const driver = await createDriver();

    try {
        await openSimulationPage(driver);

        await driver.executeScript(`
      if (!window.__simulationXhrPatched) {
        window.__simulationXhrPatched = true;

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                    let nextUrl = url;

                    if (window.__forceSimulationFail && String(url).includes('/compound-interest-simulator')) {
                        nextUrl = 'http://127.0.0.1:9/api/v1/compound-interest-simulator';
          }

                    return originalOpen.call(this, method, nextUrl, ...rest);
        };
      }

      window.__forceSimulationFail = true;
    `);

        await fillSimulationForm(driver, {
            initialValue: "10000",
            interestRate: "10",
            period: "24",
            monthlyContribution: "500",
        });

        await submitSimulation(driver);
        await waitForNormalizedText(driver, "ocorreu um erro ao realizar a simulacao", 20000);

        const text = await getBodyText(driver);
        assert.ok(!normalizeText(text).includes("valor total final"));
    } finally {
        await driver.quit();
    }
});
