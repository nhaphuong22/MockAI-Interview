/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.alterTable('companies', (table) => {
    // 1. Đổi tên vip_banner_url thành banner_url vì tính năng này không còn độc quyền VIP
    table.renameColumn('vip_banner_url', 'banner_url');
    // 2. Thêm mảng JSONB lưu ảnh giới thiệu công ty (Gallery)
    table.jsonb('images').defaultTo('[]');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.alterTable('companies', (table) => {
    // Rollback: đổi lại tên cũ và xóa cột images
    table.renameColumn('banner_url', 'vip_banner_url');
    table.dropColumn('images');
  });
};
