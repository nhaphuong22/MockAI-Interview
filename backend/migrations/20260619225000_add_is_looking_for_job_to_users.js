/**
 * Migration to add is_looking_for_job status to users.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('is_looking_for_job').defaultTo(true);
  });
}

/**
 * Revert the is_looking_for_job status from users.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_looking_for_job');
  });
}
