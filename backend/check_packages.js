import knex from 'knex';
import knexConfig from './knexfile.js';

const db = knex(knexConfig.development);

async function check() {
  try {
    const res = await db.raw(`SELECT * FROM packages`);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.destroy();
  }
}

check();
