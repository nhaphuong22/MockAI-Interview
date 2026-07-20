/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('blogs', table => {
    table.boolean('is_warned').defaultTo(false);
  });
  await knex.schema.alterTable('jobs', table => {
    table.boolean('is_warned').defaultTo(false);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('blogs', table => {
    table.dropColumn('is_warned');
  });
  await knex.schema.alterTable('jobs', table => {
    table.dropColumn('is_warned');
  });
}
