/**
 * Migration to add custom candidate contact details to applications.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('applications', (table) => {
    table.string('candidate_name').nullable();
    table.string('candidate_email').nullable();
    table.string('candidate_phone').nullable();
    table.string('portfolio_url').nullable();
  });
}

/**
 * Revert the candidate contact details from applications.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('applications', (table) => {
    table.dropColumn('candidate_name');
    table.dropColumn('candidate_email');
    table.dropColumn('candidate_phone');
    table.dropColumn('portfolio_url');
  });
}
