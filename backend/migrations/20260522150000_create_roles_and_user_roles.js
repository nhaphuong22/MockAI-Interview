/**
 * Migration: Create Roles and User Roles Tables (Empty - already handled by 20260520130000_add_missing_modules_tables.js)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Already implemented in 20260520130000_add_missing_modules_tables.js
  return Promise.resolve();
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return Promise.resolve();
}

