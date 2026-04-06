import db from './db';

async function setup() {
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
  console.log('Tabela criada com sucesso');
}

setup();
