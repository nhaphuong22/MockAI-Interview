import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('123456', salt);

  await knex('users').insert([
    {
      id: 1,
      email: 'admin@mockai.com',
      password_hash: password_hash,
      full_name: 'System Admin',
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      email: 'user@mockai.com',
      password_hash: password_hash,
      full_name: 'Test Candidate',
      role: 'USER',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      email: 'hr@mockai.com',
      password_hash: password_hash,
      full_name: 'HR Manager',
      role: 'HR',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert sample Job
  await knex('jobs').insert([
    {
      id: 1,
      hr_id: 3,
      title: 'Frontend Developer (React)',
      description: 'We are looking for a passionate Frontend Developer...',
      requirements: 'ReactJS, Tailwind CSS, JavaScript ES6+',
      status: 'OPEN',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
