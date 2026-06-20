/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('jobs', (table) => {
    table.jsonb('campaign_report_cache').nullable();
    table.timestamp('campaign_report_updated_at').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('jobs', (table) => {
    table.dropColumn('campaign_report_cache');
    table.dropColumn('campaign_report_updated_at');
  });
}
