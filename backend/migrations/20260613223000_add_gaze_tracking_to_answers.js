/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('candidate_answers', (table) => {
    table.integer('gaze_violations').defaultTo(0);
    table.integer('gaze_score_penalty').defaultTo(0);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('candidate_answers', (table) => {
    table.dropColumn('gaze_violations');
    table.dropColumn('gaze_score_penalty');
  });
}
