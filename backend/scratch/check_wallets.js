import db from '../src/db/knex.js';

async function main() {
  const wallets = await db('hr_wallets').select('*');
  console.log('Wallets:', wallets);

  const companies = await db('companies').select('id', 'name', 'is_vip', 'vip_expired_at');
  console.log('Companies:', companies);

  const transactions = await db('transactions').select('*');
  console.log('Transactions:', transactions);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
