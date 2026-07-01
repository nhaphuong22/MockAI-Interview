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
    // ==========================================
    // CÁC GÓI DÀNH CHO ỨNG VIÊN (CANDIDATE)
    // ==========================================
    // Tier 1: Miễn phí
    {
      id: 1,
      name: 'MIỄN PHÍ',
      description: 'Gói cơ bản dành cho cá nhân trải nghiệm hệ thống.',
      price: 0,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 1,
      target_role: 'CANDIDATE',
      ats_scan_limit: 3,
      ai_cover_letter_limit: 1,
      ai_practice_limit: 1,
      radar_chart_level: 'BASIC',
      cv_build_limit: 0
    },
    // Tier 2: PRO
    {
      id: 2,
      name: 'HỘI VIÊN PRO',
      description: 'Nâng cấp trải nghiệm tìm việc với công nghệ AI.',
      price: 99000,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 2,
      target_role: 'CANDIDATE',
      ats_scan_limit: 30,
      ai_cover_letter_limit: 10,
      ai_practice_limit: 10,
      radar_chart_level: 'DETAILED',
      cv_build_limit: 0
    },
    {
      id: 3,
      name: 'HỘI VIÊN PRO',
      description: 'Nâng cấp trải nghiệm tìm việc với công nghệ AI.',
      price: 990000,
      currency: 'VND',
      duration_days: 365,
      is_active: true,
      sort_order: 3,
      target_role: 'CANDIDATE',
      ats_scan_limit: 30,
      ai_cover_letter_limit: 10,
      ai_practice_limit: 10,
      radar_chart_level: 'DETAILED',
      cv_build_limit: 0
    },
    // Tier 3: VIP
    {
      id: 4,
      name: 'HỘI VIÊN VIP',
      description: 'Trải nghiệm không giới hạn mọi tính năng AI cao cấp nhất.',
      price: 199000,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 4,
      target_role: 'CANDIDATE',
      ats_scan_limit: null,
      ai_cover_letter_limit: null,
      ai_practice_limit: null,
      radar_chart_level: 'ADVANCED',
      cv_build_limit: 0
    },
    {
      id: 5,
      name: 'HỘI VIÊN VIP',
      description: 'Trải nghiệm không giới hạn mọi tính năng AI cao cấp nhất.',
      price: 1990000,
      currency: 'VND',
      duration_days: 365,
      is_active: true,
      sort_order: 5,
      target_role: 'CANDIDATE',
      ats_scan_limit: null,
      ai_cover_letter_limit: null,
      ai_practice_limit: null,
      radar_chart_level: 'ADVANCED',
      cv_build_limit: 0
    },

    // ==========================================
    // CÁC GÓI NẠP CREDIT DÀNH CHO HR (Unified Credit)
    // ==========================================
    // Starter: Trial miễn phí
    {
      id: 6,
      name: 'STARTER',
      description: 'Gói dùng thử miễn phí cho nhà tuyển dụng mới. 50 credit để trải nghiệm.',
      price: 0,
      currency: 'VND',
      duration_days: 0, // Không phải subscription
      is_active: true,
      sort_order: 6,
      target_role: 'HR',
      total_credits: 50,
      credit_expiry_days: 30,
      ats_scan_limit: 0
    },
    // Basic
    {
      id: 7,
      name: 'BASIC',
      description: 'Gói nạp 200 credit cho nhà tuyển dụng.',
      price: 199000,
      currency: 'VND',
      duration_days: 0,
      is_active: true,
      sort_order: 7,
      target_role: 'HR',
      total_credits: 200,
      credit_expiry_days: 365,
      ats_scan_limit: 0
    },
    // Pro
    {
      id: 8,
      name: 'PRO',
      description: 'Gói nạp 1.000 credit — tiết kiệm 20% cho tuyển dụng chuyên nghiệp.',
      price: 799000,
      currency: 'VND',
      duration_days: 0,
      is_active: true,
      sort_order: 8,
      target_role: 'HR',
      total_credits: 1000,
      credit_expiry_days: 365,
      ats_scan_limit: 0
    },
    // Business
    {
      id: 9,
      name: 'BUSINESS',
      description: 'Gói nạp 5.000 credit — tiết kiệm 50% cho doanh nghiệp.',
      price: 2499000,
      currency: 'VND',
      duration_days: 0,
      is_active: true,
      sort_order: 9,
      target_role: 'HR',
      total_credits: 5000,
      credit_expiry_days: 365,
      ats_scan_limit: 0
    },
    // Enterprise: Liên hệ thương lượng
    {
      id: 10,
      name: 'ENTERPRISE',
      description: 'Gói doanh nghiệp — Credit chia sẻ cho toàn bộ nhân viên HR trong công ty. Liên hệ để thương lượng.',
      price: -1, // -1 = Liên hệ thương lượng (Frontend sẽ hiển thị "Liên hệ")
      currency: 'VND',
      duration_days: 0,
      is_active: true,
      sort_order: 10,
      target_role: 'HR',
      total_credits: 10000,
      credit_expiry_days: 365,
      ats_scan_limit: 0
    }
  ]);
}
