import db from './db';

async function migrate() {
  try {
    // Check if column exists by trying to add it
    await db.execute(`ALTER TABLE responses ADD COLUMN deleted_at DATETIME DEFAULT NULL`);
    console.log('Coluna deleted_at adicionada com sucesso.');
  } catch (e: any) {
    if (e.message?.includes('duplicate column name')) {
      console.log('Coluna deleted_at já existe.');
    } else {
      console.error('Erro na migração:', e);
    }
  }
}

migrate();
