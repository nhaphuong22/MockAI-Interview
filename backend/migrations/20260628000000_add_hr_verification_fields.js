/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add columns to users table
  const hasPrivacyAgreed = await knex.schema.hasColumn('users', 'privacy_agreed');
  const hasPrivacyAgreedAt = await knex.schema.hasColumn('users', 'privacy_agreed_at');
  
  const hasAuthLetter = await knex.schema.hasColumn('users', 'auth_letter_url');
  const hasIdFront = await knex.schema.hasColumn('users', 'id_front_url');
  const hasIdBack = await knex.schema.hasColumn('users', 'id_back_url');

  await knex.schema.alterTable('users', (table) => {
    if (!hasPrivacyAgreed) table.boolean('privacy_agreed').defaultTo(false);
    if (!hasPrivacyAgreedAt) table.timestamp('privacy_agreed_at').nullable();
    
    if (!hasAuthLetter) table.text('auth_letter_url').nullable();
    if (!hasIdFront) table.text('id_front_url').nullable();
    if (!hasIdBack) table.text('id_back_url').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasPrivacyAgreed = await knex.schema.hasColumn('users', 'privacy_agreed');
  const hasPrivacyAgreedAt = await knex.schema.hasColumn('users', 'privacy_agreed_at');
  
  const hasAuthLetter = await knex.schema.hasColumn('users', 'auth_letter_url');
  const hasIdFront = await knex.schema.hasColumn('users', 'id_front_url');
  const hasIdBack = await knex.schema.hasColumn('users', 'id_back_url');

  await knex.schema.alterTable('users', (table) => {
    if (hasPrivacyAgreed) table.dropColumn('privacy_agreed');
    if (hasPrivacyAgreedAt) table.dropColumn('privacy_agreed_at');
    if (hasAuthLetter) table.dropColumn('auth_letter_url');
    if (hasIdFront) table.dropColumn('id_front_url');
    if (hasIdBack) table.dropColumn('id_back_url');
  });
}
