import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function run() {
  try {
    const users = await db('users').where('email', 'like', 'recruiter%@example.com').select('*');
    console.log('Users:', users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      company_id: u.company_id,
      is_verified_company: u.is_verified_company,
      company_verification_status: u.company_verification_status
    })));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
