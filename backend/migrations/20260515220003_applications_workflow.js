/**
 * Migration: Application workflow + utility tables
 * Creates the core application pipeline and supporting tables.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Applications - THE MOST CRITICAL TABLE
  // Represents a candidate applying to a job posting
  await knex.schema.createTable('applications', (table) => {
    table.increments('id').primary();
    table.integer('candidate_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('job_id').unsigned().notNullable()
      .references('id').inTable('jobs').onDelete('CASCADE');
    table.integer('cv_id').unsigned()
      .references('id').inTable('cvs').onDelete('SET NULL');
    table.integer('interview_id').unsigned()
      .references('id').inTable('interviews').onDelete('SET NULL');

    // Application status workflow:
    // SUBMITTED -> AI_INTERVIEW -> AI_REVIEWED -> HR_REVIEWING -> SHORTLISTED -> INTERVIEW_SCHEDULED -> HIRED / REJECTED
    table.string('status').notNullable().defaultTo('SUBMITTED');

    // AI scoring (auto-populated after AI interview + CV analysis)
    table.integer('cv_score'); // From CV analysis
    table.integer('interview_score'); // From AI interview assessment
    table.integer('total_score'); // Combined ranking score
    table.text('ai_summary'); // AI-generated candidate summary for HR

    // HR actions
    table.string('hr_tag'); // POTENTIAL, REJECTED, LATER, SHORTLISTED
    table.text('hr_notes'); // Internal notes by HR
    table.integer('reviewed_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at');

    table.text('cover_letter'); // Optional cover letter
    table.unique(['candidate_id', 'job_id']); // One application per job per candidate
    table.timestamps(true, true);
  });

  // 2. Notifications - System notification center
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable();
    // Types: JOB_ALERT, APPLICATION_UPDATE, INTERVIEW_INVITE,
    //        CV_REVIEWED, SYSTEM_NOTICE, NEW_MESSAGE
    table.string('title').notNullable();
    table.text('content');
    table.string('link'); // Deep link to relevant page
    table.integer('reference_id'); // ID of related entity (job_id, application_id, etc.)
    table.string('reference_type'); // Entity type: 'job', 'application', 'interview'
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.timestamps(true, true);
  });

  // 3. Password Resets - Secure password recovery
  await knex.schema.createTable('password_resets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamps(true, true);
  });

  // Add index for performance on frequently queried columns
  await knex.schema.alterTable('applications', (table) => {
    table.index(['job_id', 'total_score'], 'idx_applications_leaderboard');
    table.index(['candidate_id', 'status'], 'idx_applications_candidate');
    table.index('status', 'idx_applications_status');
  });

  await knex.schema.alterTable('notifications', (table) => {
    table.index(['user_id', 'is_read'], 'idx_notifications_unread');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('password_resets');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('applications');
}
