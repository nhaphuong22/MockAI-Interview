import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes all tables to start fresh
  await knex('job_requirements').del();
  await knex('applications').del();
  await knex('voice_sessions').del();
  await knex('assessments').del();
  await knex('interviews').del();
  await knex('cvs').del();
  await knex('blogs').del();
  await knex('jobs').del();
  await knex('user_roles').del();
  await knex('users').del();
  await knex('companies').del();
  
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('123456', salt);

  // Insert users without string role column
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@mockai.com',
      password_hash: password_hash,
      full_name: 'Quản trị viên Hệ thống',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      email: 'user@mockai.com',
      password_hash: password_hash,
      full_name: 'Ứng viên Thử nghiệm',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      email: 'recruiter1@mockai.com',
      password_hash: password_hash,
      full_name: 'HR TechCorp',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      email: 'recruiter2@mockai.com',
      password_hash: password_hash,
      full_name: 'HR VinaGroup',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      email: 'recruiter3@mockai.com',
      password_hash: password_hash,
      full_name: 'HR GreenEnergy',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      email: 'recruiter4@mockai.com',
      password_hash: password_hash,
      full_name: 'HR FastFinance',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      email: 'recruiter5@mockai.com',
      password_hash: password_hash,
      full_name: 'HR SmartEdu',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Query role ids to insert correct mappings
  const dbRoles = await knex('roles').select('id', 'name');
  const roleMap = dbRoles.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  // Link users to roles in user_roles table
  await knex('user_roles').insert([
    { user_id: 1, role_id: roleMap['ADMIN'], created_at: new Date(), updated_at: new Date() },
    { user_id: 2, role_id: roleMap['USER'], created_at: new Date(), updated_at: new Date() },
    { user_id: 3, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 4, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 5, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 6, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 7, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() }
  ]);

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
};
