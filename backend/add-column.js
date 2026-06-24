import db from './src/db/knex.js';

async function run() {
  try {
    const hasColumn = await db.schema.hasColumn('users', 'contact_email_verified');
    if (!hasColumn) {
      await db.schema.alterTable('users', (table) => {
        table.boolean('contact_email_verified').defaultTo(false);
      });
      console.log('Successfully added contact_email_verified column to users table');
    } else {
      console.log('Column contact_email_verified already exists');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

run();
