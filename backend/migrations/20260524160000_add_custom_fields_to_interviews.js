/**
 * Migration: Add custom fields to interviews table for custom practice sessions.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('interviews', (table) => {
    table.string('custom_position').nullable();
    table.text('custom_skills').nullable();
    table.string('experience_level').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('interviews', (table) => {
    table.dropColumn('custom_position');
    table.dropColumn('custom_skills');
    table.dropColumn('experience_level');
  });
}
