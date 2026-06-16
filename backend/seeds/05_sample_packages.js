/**
 * Seed: Sample packages data for recruiters/candidates upgrade.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries in packages table
  await knex('packages').del();

  // Inserts seed entries
  await knex('packages').insert([
    {
      id: 1,
      name: 'MIỄN PHÍ',
      description: 'Gói cơ bản dành cho cá nhân trải nghiệm hệ thống.',
      price: 0,
      currency: 'VND',
      duration_days: 30,
      job_post_limit: 5,
      cv_view_limit: 10,
      featured_post_limit: 0,
      ai_screening_enabled: false,
      is_active: true,
      sort_order: 1
    },
    {
      id: 2,
      name: 'HỘI VIÊN PRO (THÁNG)',
      description: 'Gói Pro dành cho cá nhân/nhà tuyển dụng nâng cao theo tháng.',
      price: 199000,
      currency: 'VND',
      duration_days: 30,
      job_post_limit: 100,
      cv_view_limit: 500,
      featured_post_limit: 10,
      ai_screening_enabled: true,
      is_active: true,
      sort_order: 2
    },
    {
      id: 3,
      name: 'HỘI VIÊN PRO (NĂM)',
      description: 'Gói Pro tiết kiệm theo năm với đầy đủ tính năng ưu tiên.',
      price: 1990000,
      currency: 'VND',
      duration_days: 365,
      job_post_limit: 1200,
      cv_view_limit: 6000,
      featured_post_limit: 120,
      ai_screening_enabled: true,
      is_active: true,
      sort_order: 3
    },
    {
      id: 4,
      name: 'DOANH NGHIỆP',
      description: 'Gói không giới hạn dành cho các công ty lớn và doanh nghiệp.',
      price: 9990000,
      currency: 'VND',
      duration_days: 365,
      job_post_limit: null, // Unlimited
      cv_view_limit: null, // Unlimited
      featured_post_limit: null, // Unlimited
      ai_screening_enabled: true,
      is_active: true,
      sort_order: 4
    }
  ]);
}
