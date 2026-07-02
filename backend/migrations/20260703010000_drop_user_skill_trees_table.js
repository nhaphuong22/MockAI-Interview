/**
 * Migration: Drop user_skill_trees table
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTableIfExists('user_skill_trees');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.createTable('user_skill_trees', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique()
      .references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('graph_data').notNullable();
    table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('user_skill_trees', (table) => {
    table.index('user_id', 'idx_user_skill_trees_user');
  });
}
