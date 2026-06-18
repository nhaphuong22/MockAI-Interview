import 'dotenv/config';
import db from './src/db/knex.js';

async function run() {
  try {
    const res = await db('users')
      .where('email', 'recruiter@mockai.com')
      .update({ company_verification_status: 'APPROVED' });
    console.log('Rows updated:', res);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
