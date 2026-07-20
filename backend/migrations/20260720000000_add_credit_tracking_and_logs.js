/**
 * Migration: Add credit tracking to applications and create credit_transactions table
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Alter applications table
  await knex.schema.alterTable('applications', (table) => {
    table.timestamp('invited_at');
    table.integer('credit_deducted').defaultTo(0);
    table.boolean('is_refunded').defaultTo(false);
    table.string('refund_reason');
    table.string('decline_reason');
    table.text('decline_note');
  });

  // 2. Create credit_transactions table
  await knex.schema.createTable('credit_transactions', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().references('id').inTable('hr_wallets').onDelete('CASCADE').notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('application_id').unsigned().references('id').inTable('applications').onDelete('SET NULL');
    table.integer('amount').notNullable();
    table.string('transaction_type').notNullable(); // INVITE_AI_INTERVIEW, REFUND_EXPIRED, REFUND_DECLINED, PURCHASE_PACKAGE
    table.text('description');
    table.timestamps(true, true);

    // Indexes
    table.index('wallet_id', 'idx_credit_transactions_wallet');
    table.index('application_id', 'idx_credit_transactions_application');
  });

  // Partial unique index for refunds to ensure idempotency
  await knex.raw(`
    CREATE UNIQUE INDEX idx_unique_refund 
    ON credit_transactions (application_id, transaction_type) 
    WHERE transaction_type IN ('REFUND_EXPIRED', 'REFUND_DECLINED')
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_unique_refund`);
  await knex.schema.dropTableIfExists('credit_transactions');
  await knex.schema.alterTable('applications', (table) => {
    table.dropColumn('invited_at');
    table.dropColumn('credit_deducted');
    table.dropColumn('is_refunded');
    table.dropColumn('refund_reason');
    table.dropColumn('decline_reason');
    table.dropColumn('decline_note');
  });
}
