/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.renameTable('blog_likes', 'blog_reactions');
  await knex.schema.alterTable('blog_reactions', (table) => {
    table.string('reaction_type', 50).notNullable().defaultTo('LIKE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('blog_reactions', (table) => {
    table.dropColumn('reaction_type');
  });
  await knex.schema.renameTable('blog_reactions', 'blog_likes');
}
