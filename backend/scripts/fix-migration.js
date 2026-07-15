import knex from 'knex';
import knexConfig from '../knexfile.js';
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;

const db = knex(config);

async function run() {
  console.log(`[Fix Migration] Running check for environment: ${environment}`);
  try {
    const hasTable = await db.schema.hasTable('knex_migrations');
    if (!hasTable) {
      console.log('[Fix Migration] Table knex_migrations does not exist. Skipping.');
      return;
    }

    const record = await db('knex_migrations')
      .where('name', '20260703000000_refactor_users_table.js')
      .first();

    if (record) {
      console.log('[Fix Migration] Found legacy migration record 20260703000000_refactor_users_table.js.');
      
      // Update record to match the renamed file
      await db('knex_migrations')
        .where('name', '20260703000000_refactor_users_table.js')
        .update({
          name: '20260701160000_refactor_users_table.js'
        });
      
      console.log('[Fix Migration] Successfully updated legacy migration record name to 20260701160000_refactor_users_table.js.');
    } else {
      console.log('[Fix Migration] Legacy migration record not found or already fixed.');
    }

    const missingRecord = await db('knex_migrations')
      .where('name', '20260715100000_create_curated_questions.js')
      .first();

    if (missingRecord) {
      console.log('[Fix Migration] Found missing migration record 20260715100000_create_curated_questions.js.');
      
      await db('knex_migrations')
        .where('name', '20260715100000_create_curated_questions.js')
        .delete();
      
      console.log('[Fix Migration] Successfully deleted missing migration record.');

      const hasCuratedQuestionsTable = await db.schema.hasTable('curated_questions');
      if (hasCuratedQuestionsTable) {
        await db.schema.dropTable('curated_questions');
        console.log('[Fix Migration] Successfully dropped table curated_questions.');
      }
    } else {
      console.log('[Fix Migration] Missing migration record 20260715100000_create_curated_questions.js not found in DB.');
    }
  } catch (error) {
    console.error('[Fix Migration] Error running fix-migration script:', error);
  } finally {
    await db.destroy();
  }
}

run();
