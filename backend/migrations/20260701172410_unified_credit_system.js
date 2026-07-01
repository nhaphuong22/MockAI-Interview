/**
 * Migration: Unified Credit System
 * 
 * Chuyển từ hệ thống 2 loại credit riêng biệt (JOB_POST, AI_INTERVIEW)
 * sang 1 loại credit đồng nhất (unified credits) giống CapCut.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. packages: Xoá cột cũ, thêm total_credits
  await knex.schema.alterTable('packages', (table) => {
    table.integer('total_credits').defaultTo(0).comment('Tổng credit được cấp khi mua gói (unified)');
  });

  // Migrate data: Gộp job_post_credits + ai_interview_credits vào total_credits
  await knex.raw(`
    UPDATE packages 
    SET total_credits = COALESCE(job_post_credits, 0) + COALESCE(ai_interview_credits, 0)
    WHERE target_role = 'HR'
  `);

  await knex.schema.alterTable('packages', (table) => {
    table.dropColumn('job_post_credits');
    table.dropColumn('ai_interview_credits');
    table.dropColumn('ai_screening_enabled');
    table.dropColumn('ai_interview_enabled');
    table.dropColumn('bulk_email_automation');
    table.dropColumn('featured_post_limit');
    table.dropColumn('cv_view_limit');
  });

  // 2. hr_wallets: Xoá 2 cột cũ, thêm total_credits
  await knex.schema.alterTable('hr_wallets', (table) => {
    table.integer('total_credits').defaultTo(0).comment('Tổng credit thống nhất còn lại');
  });

  // Migrate data: Gộp
  await knex.raw(`
    UPDATE hr_wallets 
    SET total_credits = COALESCE(total_job_credits, 0) + COALESCE(total_ai_credits, 0)
  `);

  await knex.schema.alterTable('hr_wallets', (table) => {
    table.dropColumn('total_job_credits');
    table.dropColumn('total_ai_credits');
  });

  // 3. credit_batches: Xoá cột credit_type
  await knex.schema.alterTable('credit_batches', (table) => {
    table.dropColumn('credit_type');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Restore credit_batches
  await knex.schema.alterTable('credit_batches', (table) => {
    table.string('credit_type').defaultTo('JOB_POST');
  });

  // Restore hr_wallets
  await knex.schema.alterTable('hr_wallets', (table) => {
    table.integer('total_job_credits').defaultTo(0);
    table.integer('total_ai_credits').defaultTo(0);
  });
  await knex.raw(`UPDATE hr_wallets SET total_job_credits = total_credits, total_ai_credits = 0`);
  await knex.schema.alterTable('hr_wallets', (table) => {
    table.dropColumn('total_credits');
  });

  // Restore packages
  await knex.schema.alterTable('packages', (table) => {
    table.integer('job_post_credits').defaultTo(0);
    table.integer('ai_interview_credits').defaultTo(0);
    table.boolean('ai_screening_enabled').defaultTo(false);
    table.boolean('ai_interview_enabled').defaultTo(false);
    table.boolean('bulk_email_automation').defaultTo(false);
    table.integer('featured_post_limit').defaultTo(0);
    table.integer('cv_view_limit').defaultTo(0);
  });
  await knex.raw(`UPDATE packages SET job_post_credits = total_credits WHERE target_role = 'HR'`);
  await knex.schema.alterTable('packages', (table) => {
    table.dropColumn('total_credits');
  });
}
