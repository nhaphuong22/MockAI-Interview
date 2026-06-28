export async function up(knex) {
  const hasTable = await knex.schema.hasTable('companies');
  if (!hasTable) return;
  const hasColumn = await knex.schema.hasColumn('companies', 'reject_reason');
  if (!hasColumn) {
    await knex.schema.alterTable('companies', (table) => {
      table.text('reject_reason');
    });
  }
}

export async function down(knex) {
  const hasTable = await knex.schema.hasTable('companies');
  if (!hasTable) return;
  const hasColumn = await knex.schema.hasColumn('companies', 'reject_reason');
  if (hasColumn) {
    await knex.schema.alterTable('companies', (table) => {
      table.dropColumn('reject_reason');
    });
  }
}
