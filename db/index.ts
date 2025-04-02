import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Datenbankverbindung erstellen
const createDbConnection = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return drizzle(pool, { schema });
};

// Exportiere DB-Instanz als Singleton
export const db = createDbConnection();