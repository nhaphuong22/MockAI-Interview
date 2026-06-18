/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('cvs', function (table) {
    table.text('html_content'); // Lưu trữ nội dung HTML của CV sau khi chỉnh sửa
    table.string('template_id'); // Lưu trữ ID của mẫu CV gốc
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('cvs', function (table) {
    table.dropColumn('html_content');
    table.dropColumn('template_id');
  });
}
