import knex from 'knex';
import knexConfig from './knexfile.js';

const db = knex(knexConfig.development);

async function fix() {
  try {
    // 1. Insert missing hr_profiles for all HR users
    const result1 = await db.raw(`
      INSERT INTO hr_profiles (user_id, company_join_status, created_at, updated_at)
      SELECT u.id, 
        CASE WHEN u.company_id IS NOT NULL THEN 'APPROVED' ELSE 'NONE' END, 
        NOW(), NOW()
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'HR'
        AND NOT EXISTS (SELECT 1 FROM hr_profiles hp WHERE hp.user_id = u.id)
    `);
    console.log('✅ Inserted missing HR profiles:', result1.rowCount, 'rows');

    // 2. Insert missing hr_wallets for all HR users
    const result2 = await db.raw(`
      INSERT INTO hr_wallets (user_id, total_credits, created_at, updated_at)
      SELECT u.id, 0, NOW(), NOW()
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'HR'
        AND NOT EXISTS (SELECT 1 FROM hr_wallets hw WHERE hw.user_id = u.id)
    `);
    console.log('✅ Inserted missing HR wallets:', result2.rowCount, 'rows');

    // 3. Insert missing candidate_profiles for all USER/CANDIDATE users
    const result3 = await db.raw(`
      INSERT INTO candidate_profiles (user_id, created_at, updated_at)
      SELECT u.id, NOW(), NOW()
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('USER', 'CANDIDATE')
        AND NOT EXISTS (SELECT 1 FROM candidate_profiles cp WHERE cp.user_id = u.id)
    `);
    console.log('✅ Inserted missing candidate profiles:', result3.rowCount, 'rows');

    // Verify
    const hrProfiles = await db('hr_profiles').count('* as count');
    const hrWallets = await db('hr_wallets').count('* as count');
    console.log('\n📊 Total hr_profiles:', hrProfiles[0].count);
    console.log('📊 Total hr_wallets:', hrWallets[0].count);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await db.destroy();
  }
}

fix();
