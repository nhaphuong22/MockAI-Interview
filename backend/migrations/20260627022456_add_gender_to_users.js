/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasGender = await knex.schema.hasColumn('users', 'gender');
  if (!hasGender) {
    await knex.schema.alterTable('users', (table) => {
      table.string('gender').defaultTo('OTHER');
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasGender = await knex.schema.hasColumn('users', 'gender');
  if (hasGender) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('gender');
    });
  }
}
