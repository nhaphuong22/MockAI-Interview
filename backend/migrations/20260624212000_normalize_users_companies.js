/**
 * Migration to normalize users and companies tables (3NF).
 * Move company_* fields from users to companies.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Add missing fields to companies table
  const hasDocumentUrl = await knex.schema.hasColumn('companies', 'document_url');
  if (!hasDocumentUrl) {
    await knex.schema.alterTable('companies', (table) => {
      table.text('document_url').nullable();
      table.string('verification_status').defaultTo('UNVERIFIED');
      table.string('city').nullable();
    });
  }

  // 2. Data Migration: Move data from users to companies
  const usersWithCompanyInfo = await knex('users')
    .select(
      'id', 'company_id', 'company_name', 'company_document_url', 
      'company_verification_status', 'company_logo', 'company_website', 
      'company_description', 'company_size', 'company_industry', 
      'company_city', 'company_address'
    )
    .whereNotNull('company_name');

  for (const user of usersWithCompanyInfo) {
    let companyId = user.company_id;

    const companyData = {
      name: user.company_name,
      document_url: user.company_document_url,
      verification_status: user.company_verification_status || 'UNVERIFIED',
      logo_url: user.company_logo,
      website: user.company_website,
      description: user.company_description,
      company_size: user.company_size,
      industry: user.company_industry,
      city: user.company_city,
      address: user.company_address,
      updated_at: new Date()
    };

    if (!companyId) {
      // Create new company
      companyData.created_at = new Date();
      const [insertedCompany] = await knex('companies').insert(companyData).returning('id');
      companyId = insertedCompany.id || insertedCompany; // Depending on DB dialect
      // Update user with new company_id
      await knex('users').where('id', user.id).update({ company_id: companyId });
    } else {
      // Update existing company
      await knex('companies').where('id', companyId).update(companyData);
    }
  }

  // 3. Drop redundant columns from users table
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_name');
    table.dropColumn('company_document_url');
    table.dropColumn('company_verification_status');
    table.dropColumn('company_logo');
    table.dropColumn('company_website');
    table.dropColumn('company_description');
    table.dropColumn('company_size');
    table.dropColumn('company_industry');
    table.dropColumn('company_city');
    table.dropColumn('company_address');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // 1. Restore columns in users table
  await knex.schema.alterTable('users', (table) => {
    table.string('company_name').nullable();
    table.text('company_document_url').nullable();
    table.string('company_verification_status').defaultTo('UNVERIFIED');
    table.text('company_logo').nullable();
    table.string('company_website').nullable();
    table.text('company_description').nullable();
    table.string('company_size').nullable();
    table.string('company_industry').nullable();
    table.string('company_city').nullable();
    table.text('company_address').nullable();
  });

  // 2. Reverse Data Migration
  const usersWithCompany = await knex('users')
    .join('companies', 'users.company_id', 'companies.id')
    .select(
      'users.id as user_id',
      'companies.name as c_name',
      'companies.document_url as c_doc',
      'companies.verification_status as c_status',
      'companies.logo_url as c_logo',
      'companies.website as c_web',
      'companies.description as c_desc',
      'companies.company_size as c_size',
      'companies.industry as c_ind',
      'companies.city as c_city',
      'companies.address as c_addr'
    );

  for (const record of usersWithCompany) {
    await knex('users').where('id', record.user_id).update({
      company_name: record.c_name,
      company_document_url: record.c_doc,
      company_verification_status: record.c_status,
      company_logo: record.c_logo,
      company_website: record.c_web,
      company_description: record.c_desc,
      company_size: record.c_size,
      company_industry: record.c_ind,
      company_city: record.c_city,
      company_address: record.c_addr
    });
  }

  // 3. Drop added columns from companies
  const hasDocumentUrl = await knex.schema.hasColumn('companies', 'document_url');
  if (hasDocumentUrl) {
    await knex.schema.alterTable('companies', (table) => {
      table.dropColumn('document_url');
      table.dropColumn('verification_status');
      table.dropColumn('city');
    });
  }
}
