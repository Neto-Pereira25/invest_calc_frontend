import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadE2eEnv() {
  const envPath = resolve(process.cwd(), ".env.e2e");

  if (!existsSync(envPath)) {
    return;
  }

  const entries = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const entry of entries) {
    const line = entry.trim();

    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadE2eEnv();

export const E2E_RUN_ID =
  process.env.E2E_RUN_ID ??
  new Date().toISOString().replace(/\D/g, "").slice(0, 14);

export const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";

export const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

export const TEST_PAUSE_MS = Number(process.env.SELENIUM_TEST_PAUSE_MS ?? 1200);

export const DEFAULT_E2E_USER = {
  name: process.env.E2E_TEST_NAME ?? "Marina Costa",
  email:
    process.env.E2E_TEST_EMAIL ??
    `selenium.${E2E_RUN_ID}@email.com`,
  password: process.env.E2E_TEST_PASSWORD ?? "12345678",
};
