import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);
const email = process.argv[2];

if (!email) {
  console.error("Vui lòng cung cấp email!");
  process.exit(1);
}

db('users').where({ email }).update({ email_verified: true })
  .then(() => {
    console.log(`Kích hoạt email cho tài khoản ${email} thành công!`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Lỗi:", err);
    process.exit(1);
  });
