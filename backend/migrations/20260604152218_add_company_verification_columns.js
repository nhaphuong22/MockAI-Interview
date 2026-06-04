/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('company_name').nullable();
    table.text('company_document_url').nullable();
    table.string('company_verification_status').defaultTo('UNVERIFIED');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_name');
    table.dropColumn('company_document_url');
    table.dropColumn('company_verification_status');
  });
}
