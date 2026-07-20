import knex from 'knex';
import knexConfig from '../knexfile.js';
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;

const db = knex(config);

async function run() {
  try {
    const hasColumn = await db.schema.hasColumn('jobs', 'enable_ai_screening');
    if (!hasColumn) {
      console.log('Adding enable_ai_screening column to jobs table...');
      await db.schema.alterTable('jobs', (table) => {
        table.boolean('enable_ai_screening').defaultTo(false).notNullable();
      });
      console.log('Column added successfully.');
    } else {
      console.log('Column enable_ai_screening already exists.');
    }
    
    // Check if the migration record exists and if not, we don't care, we just wanted the column!
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await db.destroy();
  }
}

run();
