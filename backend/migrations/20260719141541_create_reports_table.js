export async function up(knex) {
  const exists = await knex.schema.hasTable('reports');
  if (!exists) {
    await knex.schema.createTable('reports', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.integer('reporter_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('target_type').notNullable(); // 'JOB' or 'COMMUNITY_POST'
      table.integer('target_id').unsigned().notNullable(); // No FK because it can be jobs or blogs
      table.string('reason').notNullable();
      table.text('description');
      table.string('status').defaultTo('PENDING'); // PENDING, REVIEWED, RESOLVED
      table.timestamps(true, true);
      
      // 1 user only reports 1 target 1 time
      table.unique(['reporter_id', 'target_type', 'target_id']);
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('reports');
}
