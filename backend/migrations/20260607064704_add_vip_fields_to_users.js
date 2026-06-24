/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.integer('package_id').unsigned().nullable()
      .references('id').inTable('packages').onDelete('SET NULL');
    table.timestamp('vip_expiry').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('vip_expiry');
    table.dropColumn('package_id');
  });
}

