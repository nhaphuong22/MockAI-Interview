/**
 * Migration: Create blog comments and blog likes tables
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. blog_comments Table
  await knex.schema.createTable('blog_comments', (table) => {
    table.increments('id').primary();
    table.integer('blog_id').unsigned().notNullable()
      .references('id').inTable('blogs').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamps(true, true);
  });

  // 2. blog_likes Table
  await knex.schema.createTable('blog_likes', (table) => {
    table.increments('id').primary();
    table.integer('blog_id').unsigned().notNullable()
      .references('id').inTable('blogs').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Unique constraint: A user can only like a blog post once
    table.unique(['blog_id', 'user_id']);
  });

  // Indexes for faster queries
  await knex.schema.alterTable('blog_comments', (table) => {
    table.index('blog_id', 'idx_blog_comments_blog');
    table.index('user_id', 'idx_blog_comments_user');
  });

  await knex.schema.alterTable('blog_likes', (table) => {
    table.index('blog_id', 'idx_blog_likes_blog');
    table.index('user_id', 'idx_blog_likes_user');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('blog_likes');
  await knex.schema.dropTableIfExists('blog_comments');
}
