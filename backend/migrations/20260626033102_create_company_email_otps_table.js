/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('company_email_otps', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('email').notNullable();
    table.string('otp_hash').notNullable();
    table.jsonb('pending_data').notNullable();
    table.integer('attempts').defaultTo(0);
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('company_email_otps');
}
