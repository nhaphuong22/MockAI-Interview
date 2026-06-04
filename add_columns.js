import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import db from './backend/src/db/knex.js';

async function run() {
  try {
    await db.raw("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)");
    await db.raw("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_document_url TEXT");
    await db.raw("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED'");
    console.log("Columns added successfully!");
  } catch (err) {
    console.error("Error adding columns:", err);
  } finally {
    process.exit(0);
  }
}

run();
