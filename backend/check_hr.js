import knex from 'knex';
import knexConfig from './knexfile.js';

const db = knex(knexConfig.development);

async function check() {
  try {
    const res = await db.raw(`
      SELECT u.id, u.email, u.company_id, hp.company_join_status, r.name as role_name 
      FROM users u 
      LEFT JOIN user_roles ur ON u.id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.id 
      LEFT JOIN hr_profiles hp ON u.id = hp.user_id 
      WHERE u.email = 'sangpham12@fpt.com'
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.destroy();
  }
}

check();
