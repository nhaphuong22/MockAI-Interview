/**
 * Migration: Thêm thông tin mã giảm giá vào bảng transactions
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.string('coupon_code').nullable().comment('Mã giảm giá đã sử dụng');
    table.decimal('discount_amount', 14, 2).nullable().defaultTo(0).comment('Số tiền được giảm giá (VND)');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('coupon_code');
    table.dropColumn('discount_amount');
  });
}
