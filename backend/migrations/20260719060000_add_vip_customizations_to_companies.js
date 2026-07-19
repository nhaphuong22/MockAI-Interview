/**
 * Migration: Add VIP Customizations to Companies
 * Adds theme color, border style, and banner URL columns to companies table.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table.string('vip_theme_color');
    table.string('vip_border_style');
    table.string('vip_banner_url');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('vip_banner_url');
    table.dropColumn('vip_border_style');
    table.dropColumn('vip_theme_color');
  });
}
