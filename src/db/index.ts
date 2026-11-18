import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Если .env не создан — используем адрес локальной базы по умолчанию.
// Игра работает и без базы: прогресс хранится в браузере,
// а рейтинг и режим для школ просто будут недоступны.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

if (!process.env.DATABASE_URL) {
  console.warn("[КиберЩит] DATABASE_URL не задан — используется локальная база по умолчанию. Без базы не работают рейтинг и классы.");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
