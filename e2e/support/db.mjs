import { execFile } from "node:child_process";
import { promisify } from "node:util";
import "./config.mjs";

const execFileAsync = promisify(execFile);

function mysqlConfig() {
  return {
    bin: process.env.E2E_MYSQL_BIN ?? "mysql",
    host: process.env.E2E_DB_HOST,
    port: process.env.E2E_DB_PORT ?? "3306",
    database: process.env.E2E_DB_NAME,
    user: process.env.E2E_DB_USER,
    password: process.env.E2E_DB_PASSWORD ?? "",
  };
}

export function hasMysqlConfig() {
  const config = mysqlConfig();
  return Boolean(config.host && config.database && config.user);
}

export async function runMysql(sql) {
  const config = mysqlConfig();

  if (!hasMysqlConfig()) {
    throw new Error(
      "Configure E2E_DB_HOST, E2E_DB_NAME e E2E_DB_USER para usar MySQL nos testes Selenium.",
    );
  }

  const args = [
    "--batch",
    "--raw",
    "--skip-column-names",
    "-h",
    config.host,
    "-P",
    config.port,
    "-u",
    config.user,
    config.database,
    "-e",
    sql,
  ];

  const { stdout } = await execFileAsync(config.bin, args, {
    env: {
      ...process.env,
      MYSQL_PWD: config.password,
    },
  });

  return stdout.trim();
}

export async function assertMysqlAvailable() {
  if (!hasMysqlConfig()) {
    if (process.env.E2E_REQUIRE_MYSQL === "true") {
      throw new Error(
        "E2E_REQUIRE_MYSQL=true, mas as variaveis E2E_DB_* nao foram configuradas.",
      );
    }

    return false;
  }

  await runMysql("SELECT 1;");
  return true;
}

export async function runOptionalMysqlSeed() {
  if (!hasMysqlConfig() || !process.env.E2E_DB_SEED_SQL) {
    return false;
  }

  await runMysql(process.env.E2E_DB_SEED_SQL);
  return true;
}

function escapeSqlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

export async function cleanupE2eUserByEmail(email) {
  if (!hasMysqlConfig()) {
    return false;
  }

  const safeEmail = escapeSqlString(email);

  await runMysql(`
    SET @e2e_user_id := (SELECT id FROM users WHERE email = '${safeEmail}' LIMIT 1);
    DELETE fpa FROM financial_profile_answers fpa
      JOIN financial_profile_results fpr ON fpa.result_id = fpr.id
      WHERE fpr.user_id = @e2e_user_id;
    DELETE FROM financial_profile_results WHERE user_id = @e2e_user_id;
    DELETE FROM password_reset_token WHERE user_id = @e2e_user_id;
    DELETE FROM refresh_token WHERE user_id = @e2e_user_id;
    DELETE FROM spending_limits WHERE user_id = @e2e_user_id;
    DELETE FROM goals WHERE user_id = @e2e_user_id;
    DELETE FROM transactions WHERE user_id = @e2e_user_id;
    DELETE FROM users WHERE id = @e2e_user_id;
  `);

  return true;
}

export async function cleanupGeneratedE2eUsers() {
  if (!hasMysqlConfig()) {
    return false;
  }

  await runMysql(`
    DELETE fpa FROM financial_profile_answers fpa
      JOIN financial_profile_results fpr ON fpa.result_id = fpr.id
      JOIN users u ON fpr.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE fpr FROM financial_profile_results fpr
      JOIN users u ON fpr.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE prt FROM password_reset_token prt
      JOIN users u ON prt.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE rt FROM refresh_token rt
      JOIN users u ON rt.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE sl FROM spending_limits sl
      JOIN users u ON sl.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE g FROM goals g
      JOIN users u ON g.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE t FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE u.email LIKE 'selenium.%@email.com';
    DELETE FROM users WHERE email LIKE 'selenium.%@email.com';
  `);

  return true;
}
