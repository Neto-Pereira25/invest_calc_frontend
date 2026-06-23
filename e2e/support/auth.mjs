import { API_BASE_URL, DEFAULT_E2E_USER, FRONTEND_URL } from "./config.mjs";
import {
  assertMysqlAvailable,
  cleanupGeneratedE2eUsers,
  cleanupE2eUserByEmail,
  runOptionalMysqlSeed,
} from "./db.mjs";
import { clearStorage, waitForPath } from "./ui.mjs";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let body = null;
  const text = await response.text();

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { response, body };
}

export async function ensureE2eUser(user = DEFAULT_E2E_USER) {
  await assertMysqlAvailable();
  await runOptionalMysqlSeed();
  await cleanupGeneratedE2eUsers();
  await cleanupE2eUserByEmail(user.email);

  const { response, body } = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password,
    }),
  });

  if (!response.ok && ![400, 409].includes(response.status)) {
    throw new Error(
      `Nao foi possivel preparar usuario e2e (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return user;
}

export async function loginViaApi(user = DEFAULT_E2E_USER) {
  await ensureE2eUser(user);

  const { response, body } = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Nao foi possivel autenticar usuario e2e (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  const token = body?.data?.token;
  const refreshToken = body?.data?.refreshToken;

  if (!token || !refreshToken) {
    throw new Error(`Resposta de login sem tokens: ${JSON.stringify(body)}`);
  }

  return { token, refreshToken };
}

export async function loginOnce(driver, user = DEFAULT_E2E_USER) {
  const { token, refreshToken } = await loginViaApi(user);

  await driver.get(FRONTEND_URL);
  await clearStorage(driver);
  await driver.executeScript(
    `
      window.localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            token: arguments[0],
            refreshToken: arguments[1],
          },
          version: 0,
        }),
      );
    `,
    token,
    refreshToken,
  );

  await driver.get(`${FRONTEND_URL}/dashboard`);
  await waitForPath(driver, "/dashboard");
}

export async function cleanupLoggedE2eUser(user = DEFAULT_E2E_USER) {
  await cleanupE2eUserByEmail(user.email);
  await cleanupGeneratedE2eUsers();
}
