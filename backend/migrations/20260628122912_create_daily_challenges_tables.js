/**
 * Migration: Create daily challenges tables (daily_questions, daily_streaks, leaderboard_scores)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. daily_questions Table
  await knex.schema.createTable('daily_questions', (table) => {
    table.increments('id').primary();
    table.string('track').notNullable();
    table.text('question_text').notNullable();
    table.text('sample_answer').nullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  // 2. daily_streaks Table
  await knex.schema.createTable('daily_streaks', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('streak_count').notNullable().defaultTo(0);
    table.timestamp('last_answered_at').nullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  // 3. leaderboard_scores Table
  await knex.schema.createTable('leaderboard_scores', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.integer('question_id').unsigned().notNullable()
      .references('id').inTable('daily_questions').onDelete('CASCADE');
    table.timestamp('answered_at').defaultTo(knex.fn.now());

    // Composite unique constraint: A user can only submit one score per daily question
    table.unique(['user_id', 'question_id']);
  });

  // Indexes for faster queries
  await knex.schema.alterTable('daily_questions', (table) => {
    table.index('track', 'idx_daily_questions_track');
  });

  await knex.schema.alterTable('daily_streaks', (table) => {
    table.index('user_id', 'idx_daily_streaks_user');
  });

  await knex.schema.alterTable('leaderboard_scores', (table) => {
    table.index('user_id', 'idx_leaderboard_scores_user');
    table.index('question_id', 'idx_leaderboard_scores_question');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('leaderboard_scores');
  await knex.schema.dropTableIfExists('daily_streaks');
  await knex.schema.dropTableIfExists('daily_questions');
}
