/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasCol = await knex.schema.hasColumn('companies', 'business_type');
  if (!hasCol) {
    await knex.schema.alterTable('companies', (table) => {
      table.string('business_type').defaultTo('ENTERPRISE');
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasCol = await knex.schema.hasColumn('companies', 'business_type');
  if (hasCol) {
    await knex.schema.alterTable('companies', (table) => {
      table.dropColumn('business_type');
    });
  }
};
