/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('packages', (table) => {
    // Thêm các cột cho HR Credit
    table.integer('job_post_credits').defaultTo(0).comment('Số lượng credit đăng tin được cấp');
    table.integer('ai_interview_credits').defaultTo(0).comment('Số lượng credit phỏng vấn AI được cấp');
    table.integer('credit_expiry_days').defaultTo(365).comment('Thời gian hết hạn của credit (tính từ lúc mua)');

    // Đổi tên các cột limit thành các limit (thực ra đã có job_post_limit nên ta không đổi tên mà xoá hoặc drop)
    // Nhưng vì xoá có thể lỗi dữ liệu cũ, ta có thể giữ lại hoặc drop. Tạm thời drop.
    table.dropColumn('job_post_limit');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('packages', (table) => {
    table.integer('job_post_limit').defaultTo(0);
    table.dropColumn('job_post_credits');
    table.dropColumn('ai_interview_credits');
    table.dropColumn('credit_expiry_days');
  });
}
