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
      job_post_limit: 0,
      cv_view_limit: 0,
      featured_post_limit: 0,
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
      job_post_limit: 0,
      cv_view_limit: 0,
      featured_post_limit: 0,
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
      job_post_limit: 0,
      cv_view_limit: 0,
      featured_post_limit: 0,
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
      job_post_limit: 0,
      cv_view_limit: 0,
      featured_post_limit: 0,
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
      job_post_limit: 0,
      cv_view_limit: 0,
      featured_post_limit: 0,
      cv_build_limit: 0
    },

    // ==========================================
    // CÁC GÓI DÀNH CHO NHÀ TUYỂN DỤNG (HR)
    // ==========================================
    // Tier 1: STARTER
    {
      id: 6,
      name: 'STARTER',
      description: 'Gói dùng thử miễn phí dành cho nhà tuyển dụng mới.',
      price: 0,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 6,
      target_role: 'HR',
      job_post_limit: 3,
      ai_screening_enabled: false,
      ai_interview_enabled: false,
      bulk_email_automation: false,
      cv_view_limit: null,
      featured_post_limit: 0,
      ats_scan_limit: 0
    },
    // Tier 2: PROFESSIONAL
    {
      id: 7,
      name: 'PROFESSIONAL',
      description: 'Tuyển dụng chuyên nghiệp với sự hỗ trợ của AI.',
      price: 499000,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 7,
      target_role: 'HR',
      job_post_limit: 30,
      ai_screening_enabled: true,
      ai_interview_enabled: false,
      bulk_email_automation: true,
      cv_view_limit: null,
      featured_post_limit: 0,
      ats_scan_limit: 0
    },
    {
      id: 8,
      name: 'PROFESSIONAL',
      description: 'Tuyển dụng chuyên nghiệp với sự hỗ trợ của AI.',
      price: 4990000,
      currency: 'VND',
      duration_days: 365,
      is_active: true,
      sort_order: 8,
      target_role: 'HR',
      job_post_limit: 30,
      ai_screening_enabled: true,
      ai_interview_enabled: false,
      bulk_email_automation: true,
      cv_view_limit: null,
      featured_post_limit: 0,
      ats_scan_limit: 0
    },
    // Tier 3: ENTERPRISE
    {
      id: 9,
      name: 'ENTERPRISE',
      description: 'Giải pháp tuyển dụng toàn diện không giới hạn.',
      price: 999000,
      currency: 'VND',
      duration_days: 30,
      is_active: true,
      sort_order: 9,
      target_role: 'HR',
      job_post_limit: null,
      ai_screening_enabled: true,
      ai_interview_enabled: true,
      bulk_email_automation: true,
      cv_view_limit: null,
      featured_post_limit: 0,
      ats_scan_limit: 0
    },
    {
      id: 10,
      name: 'ENTERPRISE',
      description: 'Giải pháp tuyển dụng toàn diện không giới hạn.',
      price: 9990000,
      currency: 'VND',
      duration_days: 365,
      is_active: true,
      sort_order: 10,
      target_role: 'HR',
      job_post_limit: null,
      ai_screening_enabled: true,
      ai_interview_enabled: true,
      bulk_email_automation: true,
      cv_view_limit: null,
      featured_post_limit: 0,
      ats_scan_limit: 0
    }
  ]);
}
