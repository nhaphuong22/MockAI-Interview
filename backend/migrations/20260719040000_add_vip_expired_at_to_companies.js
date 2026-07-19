/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table.timestamp('vip_expired_at').nullable().comment('Thời gian hết hạn trạng thái VIP của công ty');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('vip_expired_at');
  });
}
