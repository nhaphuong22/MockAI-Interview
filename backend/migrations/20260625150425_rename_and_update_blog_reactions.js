/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasBlogLikes = await knex.schema.hasTable('blog_likes');
  if (hasBlogLikes) {
    // 1. Rename table `blog_likes` to `blog_reactions`
    await knex.schema.renameTable('blog_likes', 'blog_reactions');
  } else {
    // create it if it doesn't exist? Actually just skip renaming.
  }
  const hasReactionType = await knex.schema.hasColumn('blog_reactions', 'reaction_type');
  if (!hasReactionType) {
    await knex.schema.alterTable('blog_reactions', (table) => {
      table.string('reaction_type', 50).notNullable().defaultTo('LIKE');
    });
  }
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
