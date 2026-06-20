/**
 * Migration: Add order_index column to interview_questions table.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('interview_questions', 'order_index');
  if (!hasColumn) {
    await knex.schema.alterTable('interview_questions', (table) => {
      table.double('order_index').defaultTo(0);
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('interview_questions', 'order_index');
  if (hasColumn) {
    await knex.schema.alterTable('interview_questions', (table) => {
      table.dropColumn('order_index');
    });
  }
}
