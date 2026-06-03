/**
 * Migration: Add email verification and password reset token columns to users table.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    // Email verification fields
    table.string('verification_token').nullable();
    table.timestamp('verification_token_expires_at').nullable();

    // Password reset fields
    table.string('reset_password_token').nullable();
    table.timestamp('reset_password_expires_at').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('verification_token');
    table.dropColumn('verification_token_expires_at');
    table.dropColumn('reset_password_token');
    table.dropColumn('reset_password_expires_at');
  });
}
