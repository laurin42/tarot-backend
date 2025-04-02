import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  authId: text("auth_id").notNull().unique(), // Changed from varchar(255) to text
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  picture: varchar("picture", { length: 255 }),
  authProvider: varchar("auth_provider", { length: 20 }).notNull(),
  goals: text("goals"),
  gender: varchar('gender', { length: 1 }),
  zodiacSign: varchar('zodiac_sign', { length: 20 }),
  birthday: timestamp('birthday'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const drawnCardsTable = pgTable("drawn_cards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => usersTable.id),
  position: integer("position"),
  sessionId: varchar("session_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});