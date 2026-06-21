import dotenv from 'dotenv';
dotenv.config();
import { deleteCachePattern } from './src/config/redis.js';
async function run() {
  await deleteCachePattern('applications:*');
  console.log('Cache cleared');
  process.exit(0);
}
run();
