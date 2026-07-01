/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('id_front_public_id').nullable();
    table.string('id_back_public_id').nullable();
    table.string('auth_letter_public_id').nullable();
    table.timestamp('scheduled_delete_at').nullable().index();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('id_front_public_id');
    table.dropColumn('id_back_public_id');
    table.dropColumn('auth_letter_public_id');
    table.dropIndex('scheduled_delete_at');
    table.dropColumn('scheduled_delete_at');
  });
}
