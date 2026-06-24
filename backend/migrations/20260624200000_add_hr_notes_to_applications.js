/**
 * Migration: Add hr_notes column to applications table
 * Purpose: Allow HR to save internal notes per candidate application
 *          (e.g., "Called, waiting for reply", "Schedule offline interview 30/6")
 * Note: Uses hasColumn guard — safe to run even if column already exists.
 */

export const up = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('applications', 'hr_notes');
  if (!hasColumn) {
    await knex.schema.table('applications', (table) => {
      table.text('hr_notes').nullable().defaultTo(null)
        .comment('Internal HR notes for this application — not visible to candidates');
    });
  }
};

export const down = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('applications', 'hr_notes');
  if (hasColumn) {
    await knex.schema.table('applications', (table) => {
      table.dropColumn('hr_notes');
    });
  }
};
