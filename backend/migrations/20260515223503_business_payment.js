/**
 * Migration: Business & payment tables
 * Service packages, transactions, offer letters, and email templates.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Packages - Service plans for recruiters
  await knex.schema.createTable('packages', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable(); // Basic, Pro, Enterprise
    table.text('description');
    table.decimal('price', 14, 2).notNullable();
    table.string('currency').defaultTo('VND');
    table.integer('duration_days').notNullable(); // 30, 90, 365
    table.integer('job_post_limit'); // Max job posts allowed, null = unlimited
    table.integer('cv_view_limit'); // Max CV views allowed
    table.integer('featured_post_limit'); // Featured/boosted posts
    table.boolean('ai_screening_enabled').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // 2. Transactions - Payment history for recruiters
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('package_id').unsigned()
      .references('id').inTable('packages').onDelete('SET NULL');
    table.decimal('amount', 14, 2).notNullable();
    table.string('currency').defaultTo('VND');
    table.string('payment_method'); // BANK_TRANSFER, MOMO, VNPAY, CREDIT_CARD
    table.string('transaction_code').unique(); // External payment reference
    table.string('status').defaultTo('PENDING'); // PENDING, COMPLETED, FAILED, REFUNDED
    table.text('notes');
    table.timestamp('paid_at');
    table.timestamps(true, true);
  });

  // 3. Offers - Job offer letters from HR to candidate
  await knex.schema.createTable('offers', (table) => {
    table.increments('id').primary();
    table.integer('application_id').unsigned().notNullable()
      .references('id').inTable('applications').onDelete('CASCADE');
    table.integer('sent_by').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE'); // HR
    table.integer('candidate_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('position').notNullable();
    table.decimal('offered_salary', 14, 2);
    table.string('salary_currency').defaultTo('VND');
    table.date('start_date');
    table.text('benefits'); // Benefits description
    table.text('additional_terms');
    table.string('status').defaultTo('SENT'); // SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED
    table.timestamp('expires_at');
    table.timestamp('responded_at');
    table.text('reject_reason'); // If candidate rejects
    table.timestamps(true, true);
  });

  // 4. Email Templates - Reusable email templates for HR
  await knex.schema.createTable('email_templates', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned()
      .references('id').inTable('companies').onDelete('CASCADE');
    table.string('name').notNullable(); // "Thank You", "Rejection", "Interview Invite"
    table.string('type').notNullable(); // THANK_YOU, REJECTION, OFFER, INTERVIEW_INVITE, CUSTOM
    table.string('subject').notNullable(); // Email subject line
    table.text('body').notNullable(); // Email body with {{placeholders}}
    table.boolean('is_default').defaultTo(false); // System-wide default templates
    table.timestamps(true, true);
  });

  // Indexes
  await knex.schema.alterTable('transactions', (table) => {
    table.index(['user_id', 'status'], 'idx_transactions_user');
  });

  await knex.schema.alterTable('offers', (table) => {
    table.index(['candidate_id', 'status'], 'idx_offers_candidate');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('email_templates');
  await knex.schema.dropTableIfExists('offers');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('packages');
}
