import db from './src/db/knex.js';
import bcrypt from 'bcryptjs';

async function test() {
  try {
    const user = await db('users').where({ email: 'user@mockai.com' }).first();
    if (!user) {
      console.log('User NOT found in database!');
      return;
    }
    console.log('User found:', {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash
    });
    
    const isMatch = await bcrypt.compare('123456', user.password_hash);
    console.log('Password match test with "123456":', isMatch);
    
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await db.destroy();
  }
}

test();
