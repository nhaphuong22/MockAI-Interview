/**
 * Migration: Add snapshot_package column + performance index to transactions table.
 * - snapshot_package: stores a JSON snapshot of package info at time of purchase,
 *   preventing historical data corruption when package prices/names change later.
 * - Index on (package_id, status): optimizes the COUNT subquery used in admin package listing.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('transactions', (table) => {
    // Use json (not jsonb) for cross-DB compatibility (PostgreSQL + MySQL)
    table.json('snapshot_package').nullable()
      .comment('JSON snapshot of package details at time of purchase — immutable historical record');
  });

  // Composite index for efficient COUNT subquery in getAllPackagesForAdmin
  // Allows DB engine to use Index Scan instead of full Table Scan
  await knex.schema.alterTable('transactions', (table) => {
    table.index(['package_id', 'status'], 'idx_transactions_package_status');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex(['package_id', 'status'], 'idx_transactions_package_status');
    table.dropColumn('snapshot_package');
  });
}
