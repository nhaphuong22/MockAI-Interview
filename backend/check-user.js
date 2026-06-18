import db from './src/db/knex.js';

async function check() {
  try {
    const user = await db('users').where('email', 'recruiter@mockai.com').first();
    console.log('User status:', user.company_verification_status);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
