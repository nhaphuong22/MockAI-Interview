/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('coupons', (table) => {
    table.increments('id').primary();
    table.string('code').index().notNullable();
    table.integer('discount_percent').notNullable(); // 1 - 100
    table.integer('max_discount_amount').nullable().comment('Số tiền giảm tối đa (VND)');
    table.integer('usage_limit').nullable().defaultTo(null).comment('Giới hạn tổng số lần sử dụng');
    table.integer('used_count').defaultTo(0).notNullable();
    table.string('applicable_to').defaultTo('ALL').notNullable(); // CANDIDATE, HR, ALL
    table.timestamp('expires_at').nullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.boolean('is_deleted').defaultTo(false).notNullable(); // Phục vụ Soft Delete
    table.timestamps(true, true); // created_at, updated_at
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('coupons');
}
