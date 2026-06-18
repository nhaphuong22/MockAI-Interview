/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Xóa sạch dữ liệu cũ của jobs (kéo theo cascade các bảng liên quan) vì là dữ liệu test
  await knex('jobs').del();

  // 1. Tạo bảng job_posts (Tin đăng tuyển / Campaign)
  await knex.schema.createTable('job_posts', (table) => {
    table.increments('id').primary();
    table.integer('hr_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.string('title').notNullable(); // Tiêu đề chiến dịch
    table.text('description'); // Mô tả công ty, văn hóa, phúc lợi chung
    table.timestamp('deadline');
    table.string('status').defaultTo('OPEN');
    table.string('approval_status').defaultTo('PENDING'); // PENDING, APPROVED, REJECTED
    table.integer('approved_by').unsigned().references('id').inTable('users');
    table.timestamp('approved_at');
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true);
  });

  // 2. Cập nhật bảng jobs (đóng vai trò là Vị trí - Position)
  await knex.schema.alterTable('jobs', (table) => {
    table.integer('job_post_id').unsigned().notNullable().references('id').inTable('job_posts').onDelete('CASCADE');
    
    // Xóa các cột đã được chuyển sang job_posts
    table.dropColumn('hr_id');
    table.dropColumn('company_id');
    table.dropColumn('description');
    table.dropColumn('deadline');
    table.dropColumn('status');
    table.dropColumn('approval_status');
    table.dropColumn('approved_by');
    table.dropColumn('approved_at');
    table.dropColumn('view_count');
    
    // Các cột giữ lại trong jobs:
    // title (Tên vị trí), requirements, category_id, location_id, job_type_id, experience_level,
    // salary_min, salary_max, salary_currency, is_salary_visible, vacancy_count
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('jobs').del();

  // Revert bảng jobs
  await knex.schema.alterTable('jobs', (table) => {
    table.dropColumn('job_post_id');
    table.integer('hr_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.text('description');
    table.timestamp('deadline');
    table.string('status').defaultTo('OPEN');
    table.string('approval_status').defaultTo('PENDING');
    table.integer('approved_by').unsigned().references('id').inTable('users');
    table.timestamp('approved_at');
    table.integer('view_count').defaultTo(0);
  });

  // Xóa bảng job_posts
  await knex.schema.dropTableIfExists('job_posts');
}
