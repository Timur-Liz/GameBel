import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Профили игроков «КиберЩит: Беларусь»
export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  xp: integer("xp").notNull().default(0),
  rank: text("rank").notNull().default("Стажёр"),
  solved: integer("solved").notNull().default(0),
  achievements: integer("achievements").notNull().default(0),
  classCode: text("class_code"),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Школьные классы (режим для учителей)
export const classes = pgTable("classes", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  teacher: text("teacher").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Аккаунты: логин + пароль, привязанные к профилю игрока
export const accounts = pgTable("accounts", {
  playerId: text("player_id").primaryKey(),
  login: text("login").notNull().unique(), // в нижнем регистре
  displayLogin: text("display_login").notNull(),
  passwordHash: text("password_hash").notNull(),
  recoveryHash: text("recovery_hash"),
  lastLoginAt: timestamp("last_login_at"),
  passwordChangedAt: timestamp("password_changed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Сессии входа (в cookie хранится токен, в базе — только его хеш)
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  playerId: text("player_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
