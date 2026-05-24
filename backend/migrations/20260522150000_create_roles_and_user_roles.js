/**
 * Migration: Create Roles and User Roles Tables
 * Creates the roles and user_roles tables, seeds defaults, and migrates existing users.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Tạo bảng roles
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique(); // 'ADMIN', 'HR', 'USER'
    table.timestamps(true, true);
  });

  // 2. Tạo bảng liên kết user_roles (nhiều - nhiều)
  await knex.schema.createTable('user_roles', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('CASCADE');
    table.unique(['user_id', 'role_id']); // Tránh trùng lặp quyền cho cùng 1 user
    table.timestamps(true, true);
  });

  // 3. Seed sẵn 3 vai trò mặc định
  await knex('roles').insert([
    { name: 'ADMIN' },
    { name: 'HR' },
    { name: 'USER' }
  ]);

  // 4. Di chuyển dữ liệu: Lấy vai trò cũ từ bảng users và điền vào user_roles
  const existingUsers = await knex('users').select('id', 'role');
  for (const user of existingUsers) {
    const roleName = user.role || 'USER';
    // Tìm role ID tương ứng trong bảng roles mới tạo
    const roleRecord = await knex('roles').where({ name: roleName }).first();
    if (roleRecord) {
      await knex('user_roles').insert({
        user_id: user.id,
        role_id: roleRecord.id
      });
    } else {
      // Fallback nếu có vai trò lạ, gán là USER
      const defaultRole = await knex('roles').where({ name: 'USER' }).first();
      if (defaultRole) {
        await knex('user_roles').insert({
          user_id: user.id,
          role_id: defaultRole.id
        });
      }
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('roles');
}
