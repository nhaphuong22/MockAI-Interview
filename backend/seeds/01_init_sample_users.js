import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes blogs, jobs, user_roles first, then users to respect foreign keys
  await knex('blogs').del();
  await knex('jobs').del();
  await knex('user_roles').del();
  await knex('users').del();
  
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
      email: 'recruiter@mockai.com',
      password_hash: password_hash,
      full_name: 'Nhà Tuyển Dụng MockAI',
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
    { user_id: 3, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() }
  ]);

  // Đảm bảo xóa jobs cũ trước khi chèn mới để tránh lỗi khóa chính nếu chạy lại seed
  await knex('jobs').del();
  
  // Insert sample Job
  await knex('jobs').insert([
    {
      id: 1,
      hr_id: 3,
      title: 'Frontend Developer (React)',
      description: 'Chúng tôi đang tìm kiếm một Frontend Developer đam mê React...',
      requirements: 'ReactJS, Tailwind CSS, JavaScript ES6+',
      status: 'OPEN',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
  await knex.raw("SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs))");
};

