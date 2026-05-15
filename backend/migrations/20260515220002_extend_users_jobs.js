/**
 * Migration: Extend existing tables + create junction tables
 * Adds missing columns to users & jobs, creates N-N relationship tables.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Extend users table
  await knex.schema.alterTable('users', (table) => {
    table.string('phone');
    table.string('avatar_url');
    table.text('bio');
    table.date('date_of_birth');
    table.string('address');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('SET NULL');
  });

  // 2. Extend jobs table
  await knex.schema.alterTable('jobs', (table) => {
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.integer('location_id').unsigned().references('id').inTable('locations').onDelete('SET NULL');
    table.integer('job_type_id').unsigned().references('id').inTable('job_types').onDelete('SET NULL');
    table.string('experience_level'); // INTERN, JUNIOR, MID, SENIOR, LEAD
    table.decimal('salary_min', 14, 2);
    table.decimal('salary_max', 14, 2);
    table.string('salary_currency').defaultTo('VND');
    table.boolean('is_salary_visible').defaultTo(true);
    table.integer('vacancy_count').defaultTo(1);
    table.timestamp('deadline');
    table.string('approval_status').defaultTo('PENDING'); // PENDING, APPROVED, REJECTED
    table.integer('approved_by').unsigned().references('id').inTable('users');
    table.timestamp('approved_at');
    table.integer('view_count').defaultTo(0);
  });

  // 3. Job Skills - N-N relationship
  await knex.schema.createTable('job_skills', (table) => {
    table.increments('id').primary();
    table.integer('job_id').unsigned().references('id').inTable('jobs').onDelete('CASCADE');
    table.integer('skill_id').unsigned().references('id').inTable('skills').onDelete('CASCADE');
    table.unique(['job_id', 'skill_id']); // Prevent duplicates
    table.timestamps(true, true);
  });

  // 4. User Skills - N-N relationship
  await knex.schema.createTable('user_skills', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('skill_id').unsigned().references('id').inTable('skills').onDelete('CASCADE');
    table.string('proficiency_level'); // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    table.integer('years_of_experience');
    table.unique(['user_id', 'skill_id']); // Prevent duplicates
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Drop junction tables first
  await knex.schema.dropTableIfExists('user_skills');
  await knex.schema.dropTableIfExists('job_skills');

  // Revert jobs extension
  await knex.schema.alterTable('jobs', (table) => {
    table.dropColumn('company_id');
    table.dropColumn('category_id');
    table.dropColumn('location_id');
    table.dropColumn('job_type_id');
    table.dropColumn('experience_level');
    table.dropColumn('salary_min');
    table.dropColumn('salary_max');
    table.dropColumn('salary_currency');
    table.dropColumn('is_salary_visible');
    table.dropColumn('vacancy_count');
    table.dropColumn('deadline');
    table.dropColumn('approval_status');
    table.dropColumn('approved_by');
    table.dropColumn('approved_at');
    table.dropColumn('view_count');
  });

  // Revert users extension
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('phone');
    table.dropColumn('avatar_url');
    table.dropColumn('bio');
    table.dropColumn('date_of_birth');
    table.dropColumn('address');
    table.dropColumn('is_active');
    table.dropColumn('email_verified');
    table.dropColumn('company_id');
  });
}
