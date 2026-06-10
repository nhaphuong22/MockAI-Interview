/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('company_city').nullable();
    table.text('company_address').nullable();
    table.string('contact_email').nullable();
    table.string('contact_phone').nullable();
    table.boolean('contact_public').defaultTo(true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_city');
    table.dropColumn('company_address');
    table.dropColumn('contact_email');
    table.dropColumn('contact_phone');
    table.dropColumn('contact_public');
  });
}
