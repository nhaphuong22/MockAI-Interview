/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasRadar = await knex.schema.hasColumn('assessments', 'radar_skills');
  const hasQA = await knex.schema.hasColumn('assessments', 'qa_details');

  await knex.schema.alterTable('assessments', (table) => {
    if (!hasRadar) {
      table.jsonb('radar_skills'); // Radar chart evaluation data
    }
    if (!hasQA) {
      table.jsonb('qa_details');   // Detailed question, answer, score & AI feedback breakdown
    }
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('assessments', (table) => {
    table.dropColumn('radar_skills');
    table.dropColumn('qa_details');
  });
}
