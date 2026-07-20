/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('hr_profiles', (table) => {
    table.string('gender').nullable();
    table.text('address').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('hr_profiles', (table) => {
    table.dropColumn('gender');
    table.dropColumn('address');
  });
}
