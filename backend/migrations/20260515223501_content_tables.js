/**
 * Migration: Content management tables
 * CV templates for admin management and blog/community posts.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {

  // 2. Blogs - Community posts / articles
  await knex.schema.createTable('blogs', (table) => {
    table.increments('id').primary();
    table.integer('author_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('slug').notNullable().unique();
    table.text('content').notNullable(); // Markdown or HTML
    table.string('cover_image_url');
    table.string('category'); // Career Tips, Interview Guide, Industry News...
    table.specificType('tags', 'text[]'); // PostgreSQL array of tags
    table.string('status').defaultTo('DRAFT'); // DRAFT, PENDING, PUBLISHED, REJECTED
    table.text('reject_reason'); // Admin rejection reason
    table.integer('approved_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('published_at');
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true);
  });

  // Index for blog listing
  await knex.schema.alterTable('blogs', (table) => {
    table.index(['status', 'published_at'], 'idx_blogs_published');
    table.index('author_id', 'idx_blogs_author');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('blogs');

}
