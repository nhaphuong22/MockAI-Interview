/**
 * Migration: Create job_requirements table
 * Stores detailed requirements for each job posting
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('job_requirements', (table) => {
    table.increments('id').primary();
    table.integer('job_id').unsigned().notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    table.string('requirement_type').notNullable(); // EDUCATION, EXPERIENCE, SKILL, LANGUAGE, CERTIFICATE, OTHER
    table.text('description').notNullable();
    table.boolean('is_required').defaultTo(true); // Required vs Nice-to-have
    table.integer('priority').defaultTo(0); // For ordering requirements
    table.timestamps(true, true);
    
    // Index for faster queries
    table.index('job_id');
    table.index('requirement_type');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('job_requirements');
}
