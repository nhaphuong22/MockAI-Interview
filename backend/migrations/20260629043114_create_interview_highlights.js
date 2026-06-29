/**
 * Migration: Create interview_highlights table
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('interview_highlights', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().notNullable().unique()
      .references('id').inTable('interviews').onDelete('CASCADE');
    table.text('highlight_summary').notNullable();
    table.boolean('is_flagged').notNullable().defaultTo(false);
    table.jsonb('timestamps_data').notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('interview_highlights');
}
