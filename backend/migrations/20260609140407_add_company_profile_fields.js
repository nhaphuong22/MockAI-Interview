/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.text('company_logo').nullable();
    table.string('company_website').nullable();
    table.text('company_description').nullable();
    table.string('company_size').nullable();
    table.string('company_industry').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_logo');
    table.dropColumn('company_website');
    table.dropColumn('company_description');
    table.dropColumn('company_size');
    table.dropColumn('company_industry');
  });
}
