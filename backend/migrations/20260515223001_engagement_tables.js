/**
 * Migration: Candidate engagement tables
 * Saved jobs, company follows, and job alert subscriptions.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Saved Jobs - Candidates bookmark jobs for later
  await knex.schema.createTable('saved_jobs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('job_id').unsigned().notNullable()
      .references('id').inTable('jobs').onDelete('CASCADE');
    table.unique(['user_id', 'job_id']); // Prevent duplicate bookmarks
    table.timestamps(true, true);
  });

  // 2. Company Followers - Candidates follow companies for updates
  await knex.schema.createTable('company_followers', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('company_id').unsigned().notNullable()
      .references('id').inTable('companies').onDelete('CASCADE');
    table.unique(['user_id', 'company_id']); // One follow per company per user
    table.timestamps(true, true);
  });

  // 3. Job Alerts - Email subscription for new job notifications
  await knex.schema.createTable('job_alerts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('keyword'); // Search keyword to match
    table.integer('category_id').unsigned()
      .references('id').inTable('categories').onDelete('SET NULL');
    table.integer('location_id').unsigned()
      .references('id').inTable('locations').onDelete('SET NULL');
    table.integer('job_type_id').unsigned()
      .references('id').inTable('job_types').onDelete('SET NULL');
    table.string('experience_level'); // INTERN, JUNIOR, MID, SENIOR
    table.decimal('salary_min', 14, 2);
    table.string('frequency').defaultTo('DAILY'); // INSTANT, DAILY, WEEKLY
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('job_alerts');
  await knex.schema.dropTableIfExists('company_followers');
  await knex.schema.dropTableIfExists('saved_jobs');
}
