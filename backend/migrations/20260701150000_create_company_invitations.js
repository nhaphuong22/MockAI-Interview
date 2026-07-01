/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('company_invitations');
  if (!exists) {
    await knex.schema.createTable('company_invitations', (table) => {
      table.increments('id').primary();
      table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
      table.string('email').notNullable();
      table.string('token').notNullable().unique();
      table.string('status').defaultTo('PENDING'); // PENDING, ACCEPTED, REJECTED, EXPIRED
      table.timestamp('expires_at').notNullable();
      table.timestamps(true, true);
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('company_invitations');
}
