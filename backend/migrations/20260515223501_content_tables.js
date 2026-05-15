/**
 * Migration: Content management tables
 * CV templates for admin management and blog/community posts.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. CV Templates - Admin-managed CV templates for candidates
  await knex.schema.createTable('cv_templates', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('thumbnail_url'); // Preview image
    table.text('html_structure'); // Template HTML/JSON structure
    table.string('category'); // IT, Business, Design, General...
    table.boolean('is_premium').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('usage_count').defaultTo(0);
    table.integer('created_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL'); // Admin who created
    table.timestamps(true, true);
  });

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
  await knex.schema.dropTableIfExists('cv_templates');
}
