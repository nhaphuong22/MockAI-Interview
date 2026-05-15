/**
 * Migration: User feedback and report tables
 * System feedback and violation reports from users.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Feedbacks - User suggestions to improve the platform
  await knex.schema.createTable('feedbacks', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('subject').notNullable();
    table.text('content').notNullable();
    table.string('category'); // BUG, FEATURE_REQUEST, UI_UX, OTHER
    table.integer('rating'); // 1-5 satisfaction rating
    table.string('status').defaultTo('OPEN'); // OPEN, REVIEWING, RESOLVED, CLOSED
    table.text('admin_response'); // Admin's reply
    table.integer('responded_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // 2. Reports - Violation reports (jobs, users, blogs)
  await knex.schema.createTable('reports', (table) => {
    table.increments('id').primary();
    table.integer('reporter_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('target_type').notNullable(); // USER, JOB, BLOG, COMPANY
    table.integer('target_id').notNullable(); // ID of reported entity
    table.string('reason').notNullable();
    // SPAM, FRAUD, INAPPROPRIATE, MISLEADING, HARASSMENT, OTHER
    table.text('description'); // Detailed description
    table.string('evidence_url'); // Screenshot or proof
    table.string('status').defaultTo('PENDING'); // PENDING, INVESTIGATING, RESOLVED, DISMISSED
    table.text('resolution_notes'); // Admin resolution notes
    table.integer('resolved_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('resolved_at');
    table.timestamps(true, true);
  });

  // Indexes
  await knex.schema.alterTable('reports', (table) => {
    table.index(['target_type', 'target_id'], 'idx_reports_target');
    table.index('status', 'idx_reports_status');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('feedbacks');
}
