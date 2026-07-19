/**
 * Migration: Add contact_email_verified to users
 * Adds contact_email_verified column to users table and performs initial data migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('contact_email_verified').defaultTo(false);
  });

  // Data Migration: Set contact_email_verified = true for users who already have contact_email
  await knex('users').whereNotNull('contact_email').update({ contact_email_verified: true });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('contact_email_verified');
  });
}
