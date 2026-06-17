/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('packages', (table) => {
    // Phân loại gói dành cho ứng viên hay HR
    table.enu('target_role', ['CANDIDATE', 'HR']).defaultTo('HR');
    
    // Quyền lợi của Candidate
    table.integer('cv_build_limit').nullable();
    table.integer('ai_practice_limit').nullable();
    table.integer('ats_scan_limit').nullable();
    table.integer('ai_cover_letter_limit').nullable();
    table.string('radar_chart_level').defaultTo('BASIC'); // BASIC, DETAILED, ADVANCED
    
    // Quyền lợi mở rộng của HR
    table.boolean('ai_interview_enabled').defaultTo(false);
    table.boolean('bulk_email_automation').defaultTo(false);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('packages', (table) => {
    table.dropColumn('target_role');
    table.dropColumn('cv_build_limit');
    table.dropColumn('ai_practice_limit');
    table.dropColumn('ats_scan_limit');
    table.dropColumn('ai_cover_letter_limit');
    table.dropColumn('radar_chart_level');
    table.dropColumn('ai_interview_enabled');
    table.dropColumn('bulk_email_automation');
  });
}
