/**
 * Migration: HR workflow tables
 * Interview scheduling and HR candidate evaluations.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Interview Schedules - HR schedules real interviews with candidates
  await knex.schema.createTable('interview_schedules', (table) => {
    table.increments('id').primary();
    table.integer('application_id').unsigned().notNullable()
      .references('id').inTable('applications').onDelete('CASCADE');
    table.integer('scheduled_by').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE'); // HR who scheduled
    table.integer('candidate_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    table.string('title').notNullable(); // e.g., "Technical Interview Round 1"
    table.timestamp('scheduled_at').notNullable(); // Date & time of interview
    table.integer('duration_minutes').defaultTo(60);
    table.string('format').notNullable().defaultTo('ONLINE'); // ONLINE, OFFLINE
    table.string('meeting_link'); // Google Meet / Zoom link (for ONLINE)
    table.string('location'); // Office address (for OFFLINE)
    table.text('notes'); // Instructions for the candidate

    // Status: PENDING -> CONFIRMED -> COMPLETED -> CANCELLED
    table.string('status').defaultTo('PENDING');
    table.text('cancel_reason'); // Reason if cancelled

    table.timestamps(true, true);
  });

  // 2. HR Evaluations - HR's assessment after real interviews
  await knex.schema.createTable('hr_evaluations', (table) => {
    table.increments('id').primary();
    table.integer('application_id').unsigned().notNullable()
      .references('id').inTable('applications').onDelete('CASCADE');
    table.integer('schedule_id').unsigned()
      .references('id').inTable('interview_schedules').onDelete('SET NULL');
    table.integer('evaluator_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE'); // HR who evaluated

    table.string('round').notNullable(); // "CV_SCREENING", "ROUND_1", "ROUND_2", "FINAL"
    table.integer('technical_score'); // 1-10
    table.integer('communication_score'); // 1-10
    table.integer('culture_fit_score'); // 1-10
    table.integer('overall_score'); // 1-10
    table.text('strengths'); // What the candidate did well
    table.text('weaknesses'); // Areas for improvement
    table.text('comments'); // General comments
    table.string('recommendation').notNullable().defaultTo('PENDING');
    // STRONG_HIRE, HIRE, NO_HIRE, STRONG_NO_HIRE, PENDING

    table.timestamps(true, true);
  });

  // Add indexes for performance
  await knex.schema.alterTable('interview_schedules', (table) => {
    table.index(['candidate_id', 'scheduled_at'], 'idx_schedules_candidate');
    table.index(['scheduled_by', 'status'], 'idx_schedules_hr');
  });

  await knex.schema.alterTable('hr_evaluations', (table) => {
    table.index('application_id', 'idx_evaluations_application');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('hr_evaluations');
  await knex.schema.dropTableIfExists('interview_schedules');
}
