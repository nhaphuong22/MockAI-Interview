/**
 * Migration: Add enable_ai_screening column to jobs table
 * Also adds PAUSED as a valid status for job visibility control
 */
export const up = async (knex) => {
  // Add enable_ai_screening column
  const hasColumn = await knex.schema.hasColumn('jobs', 'enable_ai_screening');
  if (!hasColumn) {
    await knex.schema.alterTable('jobs', (table) => {
      table.boolean('enable_ai_screening').defaultTo(false).notNullable();
    });
  }
};

export const down = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('jobs', 'enable_ai_screening');
  if (hasColumn) {
    await knex.schema.alterTable('jobs', (table) => {
      table.dropColumn('enable_ai_screening');
    });
  }
};
