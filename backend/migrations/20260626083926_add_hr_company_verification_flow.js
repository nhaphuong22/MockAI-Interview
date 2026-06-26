/**
 * Migration to add company verification and link flow fields.
 * Adds tax_code and creator_id to companies.
 * Adds company_join_status to users.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Alter companies table
  const hasTaxCode = await knex.schema.hasColumn('companies', 'tax_code');
  const hasCreatorId = await knex.schema.hasColumn('companies', 'creator_id');

  await knex.schema.alterTable('companies', (table) => {
    if (!hasTaxCode) {
      table.string('tax_code').nullable();
    }
    if (!hasCreatorId) {
      table.integer('creator_id').unsigned()
        .references('id').inTable('users')
        .onDelete('SET NULL')
        .nullable();
    }
  });

  // 2. Alter users table
  const hasCompanyJoinStatus = await knex.schema.hasColumn('users', 'company_join_status');
  await knex.schema.alterTable('users', (table) => {
    if (!hasCompanyJoinStatus) {
      table.string('company_join_status').nullable().defaultTo(null);
    }
  });

  // 3. Data Migration: Set company_join_status = 'APPROVED' for existing users with company_id
  await knex('users')
    .whereNotNull('company_id')
    .update({ company_join_status: 'APPROVED' });

  // 4. Data Migration: Link existing companies to a creator (first user in that company)
  const companiesWithoutCreator = await knex('companies')
    .whereNull('creator_id')
    .select('id');

  for (const company of companiesWithoutCreator) {
    // Find first user with this company_id
    const firstUser = await knex('users')
      .where({ company_id: company.id })
      .orderBy('id', 'asc')
      .first();

    if (firstUser) {
      await knex('companies')
        .where({ id: company.id })
        .update({ creator_id: firstUser.id });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // 1. Remove columns from users
  const hasCompanyJoinStatus = await knex.schema.hasColumn('users', 'company_join_status');
  await knex.schema.alterTable('users', (table) => {
    if (hasCompanyJoinStatus) {
      table.dropColumn('company_join_status');
    }
  });

  // 2. Remove columns from companies
  const hasTaxCode = await knex.schema.hasColumn('companies', 'tax_code');
  const hasCreatorId = await knex.schema.hasColumn('companies', 'creator_id');

  await knex.schema.alterTable('companies', (table) => {
    if (hasCreatorId) {
      table.dropColumn('creator_id');
    }
    if (hasTaxCode) {
      table.dropColumn('tax_code');
    }
  });
}
