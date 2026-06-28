/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasIdCard = await knex.schema.hasColumn('users', 'id_card_number');
  if (!hasIdCard) {
    await knex.schema.alterTable('users', (table) => {
      table.string('id_card_number', 20).nullable();
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasIdCard = await knex.schema.hasColumn('users', 'id_card_number');
  if (hasIdCard) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('id_card_number');
    });
  }
}
