/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('coupons').del();
  
  await knex('coupons').insert([
    {
      code: 'MOCKAI50',
      discount_percent: 50,
      max_discount_amount: 500000,
      usage_limit: 100,
      used_count: 0,
      applicable_to: 'ALL',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      code: 'WELCOME10',
      discount_percent: 10,
      max_discount_amount: null,
      usage_limit: null,
      used_count: 0,
      applicable_to: 'ALL',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}
