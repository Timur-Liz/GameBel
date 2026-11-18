import { sql } from "drizzle-orm";
import { db } from "./index";

// Создаёт таблицы при первом обращении к базе (если их ещё нет).
// Благодаря этому при публикации достаточно указать DATABASE_URL.
let ready: Promise<void> | null = null;

export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS players (
          id text NOT NULL CONSTRAINT players_pkey PRIMARY KEY,
          name text NOT NULL,
          xp integer DEFAULT 0 NOT NULL,
          rank text DEFAULT 'Стажёр' NOT NULL,
          solved integer DEFAULT 0 NOT NULL,
          state jsonb NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
        ALTER TABLE players ADD COLUMN IF NOT EXISTS achievements integer DEFAULT 0 NOT NULL;
        ALTER TABLE players ADD COLUMN IF NOT EXISTS class_code text;

        CREATE TABLE IF NOT EXISTS classes (
          code text NOT NULL CONSTRAINT classes_pkey PRIMARY KEY,
          name text NOT NULL,
          teacher text NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS accounts (
          player_id text NOT NULL CONSTRAINT accounts_pkey PRIMARY KEY,
          login text NOT NULL CONSTRAINT accounts_login_unique UNIQUE,
          display_login text NOT NULL,
          password_hash text NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL
        );
        ALTER TABLE accounts ADD COLUMN IF NOT EXISTS recovery_hash text;
        ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_login_at timestamp;
        ALTER TABLE accounts ADD COLUMN IF NOT EXISTS password_changed_at timestamp;

        CREATE TABLE IF NOT EXISTS sessions (
          token_hash text NOT NULL CONSTRAINT sessions_pkey PRIMARY KEY,
          player_id text NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          expires_at timestamp NOT NULL
        );
      `);
    })().catch((e) => {
      ready = null; // повторить попытку при следующем запросе
      throw e;
    });
  }
  return ready;
}
