import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// For existing code compatibility
export const client = db;

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      contact_name TEXT,
      product_service TEXT,
      employees TEXT,
      years_existing TEXT,
      answers TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export default db;
