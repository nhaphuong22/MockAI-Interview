/**
 * Migration: Messaging system
 * Conversations and messages between users (HR <-> Candidate).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // No-op: conversations and messages tables removed
}

export async function down(knex) {
  // No-op: conversations and messages tables removed
}
