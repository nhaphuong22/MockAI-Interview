import db from './src/db/knex.js';

async function main() {
  const tables = await db.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log(tables.rows.map(r => r.tablename));
  process.exit(0);
}

main();
