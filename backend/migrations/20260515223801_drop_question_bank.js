/**
 * Migration: Remove question_bank table
 * AI will generate interview questions dynamically based on CV + JD context.
 * No need for a static question bank.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTableIfExists('question_bank');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Recreate if rollback needed
  await knex.schema.createTable('question_bank', (table) => {
    table.increments('id').primary();
    table.integer('job_id').unsigned().references('id').inTable('jobs').onDelete('CASCADE');
    table.string('category');
    table.text('content').notNullable();
    table.text('expected_answer');
    table.timestamps(true, true);
  });
}
