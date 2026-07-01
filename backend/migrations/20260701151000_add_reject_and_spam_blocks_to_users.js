/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.integer('company_rejected_id').nullable().index();
    table.timestamp('company_rejected_at').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('company_rejected_id');
    table.dropColumn('company_rejected_id');
    table.dropColumn('company_rejected_at');
  });
}
