import "dotenv/config";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "tarot_db",
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: false
  },
  verbose: true,
  strict: true
} satisfies Config);
