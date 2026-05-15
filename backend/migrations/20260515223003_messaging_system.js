/**
 * Migration: Messaging system
 * Conversations and messages between users (HR <-> Candidate).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Conversations - Chat threads between two users
  await knex.schema.createTable('conversations', (table) => {
    table.increments('id').primary();
    table.integer('participant_one').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('participant_two').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('application_id').unsigned()
      .references('id').inTable('applications').onDelete('SET NULL'); // Optional context
    table.timestamp('last_message_at'); // For sorting conversations
    table.unique(['participant_one', 'participant_two']); // One conversation per pair
    table.timestamps(true, true);
  });

  // 2. Messages - Individual messages in a conversation
  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().notNullable()
      .references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('sender_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.string('type').defaultTo('TEXT'); // TEXT, FILE, IMAGE
    table.string('file_url'); // Attachment URL if type is FILE/IMAGE
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.timestamps(true, true);
  });

  // Add indexes for chat performance
  await knex.schema.alterTable('conversations', (table) => {
    table.index('participant_one', 'idx_conv_participant_one');
    table.index('participant_two', 'idx_conv_participant_two');
    table.index('last_message_at', 'idx_conv_last_message');
  });

  await knex.schema.alterTable('messages', (table) => {
    table.index(['conversation_id', 'created_at'], 'idx_messages_timeline');
    table.index(['sender_id', 'is_read'], 'idx_messages_unread');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversations');
}
