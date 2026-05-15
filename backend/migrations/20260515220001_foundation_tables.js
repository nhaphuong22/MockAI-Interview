/**
 * Migration: Foundation Tables
 * Creates base catalog and company tables that other tables depend on.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Companies - Recruiter company profiles
  await knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('logo_url');
    table.string('website');
    table.string('industry');
    table.string('company_size'); // 1-10, 11-50, 51-200, 201-500, 500+
    table.text('description');
    table.string('address');
    table.string('phone');
    table.string('email');
    table.string('tax_code').unique(); // Mã số thuế
    table.boolean('is_verified').defaultTo(false);
    table.timestamps(true, true);
  });

  // 2. Categories - Job categories/industries
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.string('icon'); // Icon name or URL
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // 3. Skills - Global skills catalog
  await knex.schema.createTable('skills', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // 4. Locations - Geographic locations
  await knex.schema.createTable('locations', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable(); // e.g., "Hồ Chí Minh", "Hà Nội"
    table.string('slug').notNullable().unique();
    table.string('region'); // Miền Bắc, Miền Trung, Miền Nam
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // 5. Job Types - Employment types
  await knex.schema.createTable('job_types', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique(); // Full-time, Part-time, Remote, Internship, Contract
    table.string('slug').notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('job_types');
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('skills');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('companies');
}
