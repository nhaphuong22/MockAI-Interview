/**
 * Seed: Sample packages data & completed transactions for Admin analytics.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries in transactions & packages table
  await knex('transactions').del();
  await knex('packages').del();

  // Inserts seed entries for packages
  await knex('packages').insert([
    // ==========================================
    // CÁC GÓI DÀNH CHO ỨNG VIÊN (CANDIDATE)
    // ==========================================
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
      name: 'HỘI VIÊN PRO (NĂM)',
      description: 'Nâng cấp trải nghiệm tìm việc với công nghệ AI theo năm.',
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
      name: 'HỘI VIÊN VIP (NĂM)',
      description: 'Trải nghiệm không giới hạn mọi tính năng AI cao cấp nhất theo năm.',
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
    {
      id: 6,
      name: 'STARTER',
      description: 'Gói dùng thử miễn phí cho nhà tuyển dụng mới. 50 credit để trải nghiệm.',
      price: 0,
      currency: 'VND',
      duration_days: 0,
      is_active: true,
      sort_order: 6,
      target_role: 'HR',
      total_credits: 50,
      credit_expiry_days: 30,
      ats_scan_limit: 0
    },
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
    {
      id: 10,
      name: 'ENTERPRISE',
      description: 'Gói doanh nghiệp — Credit chia sẻ cho toàn bộ nhân viên HR trong công ty.',
      price: -1,
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

  // Seed sample COMPLETED transactions distributed across the last 7 days
  const now = new Date();
  const getPastDate = (daysAgo, hours = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, 0, 0, 0);
    return d;
  };

  const sampleTransactions = [
    // 6 days ago (Thứ Ba)
    {
      user_id: 3, // HR TechCorp
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + (Date.now() - 6 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Thanh toán gói nạp 5.000 credit qua VNPAY',
      paid_at: getPastDate(6, 9),
      created_at: getPastDate(6, 9),
      updated_at: getPastDate(6, 9)
    },
    {
      user_id: 2, // Candidate
      package_id: 4, // VIP
      amount: 199000,
      currency: 'VND',
      payment_method: 'MOMO',
      transaction_code: 'TXN_' + (Date.now() - 6 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Nâng cấp gói Hội viên VIP 1 tháng',
      paid_at: getPastDate(6, 14),
      created_at: getPastDate(6, 14),
      updated_at: getPastDate(6, 14)
    },

    // 5 days ago (Thứ Tư)
    {
      user_id: 4, // HR VinaGroup
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'BANK_TRANSFER',
      transaction_code: 'TXN_' + (Date.now() - 5 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Chuyển khoản ngân hàng nâng cấp gói Credit doanh nghiệp',
      paid_at: getPastDate(5, 10),
      created_at: getPastDate(5, 10),
      updated_at: getPastDate(5, 10)
    },
    {
      user_id: 5, // HR GreenEnergy
      package_id: 8, // PRO
      amount: 799000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + (Date.now() - 5 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Thanh toán gói 1.000 Credit',
      paid_at: getPastDate(5, 15),
      created_at: getPastDate(5, 15),
      updated_at: getPastDate(5, 15)
    },

    // 4 days ago (Thứ Năm)
    {
      user_id: 6, // HR FastFinance
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + (Date.now() - 4 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Gói nạp 5.000 credit cho tuyển dụng Fintech',
      paid_at: getPastDate(4, 11),
      created_at: getPastDate(4, 11),
      updated_at: getPastDate(4, 11)
    },
    {
      user_id: 7, // HR SmartEdu
      package_id: 8, // PRO
      amount: 799000,
      currency: 'VND',
      payment_method: 'MOMO',
      transaction_code: 'TXN_' + (Date.now() - 4 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Nạp gói PRO 1.000 credits',
      paid_at: getPastDate(4, 16),
      created_at: getPastDate(4, 16),
      updated_at: getPastDate(4, 16)
    },

    // 3 days ago (Thứ Sáu)
    {
      user_id: 3, // HR TechCorp
      package_id: 8, // PRO
      amount: 799000,
      currency: 'VND',
      payment_method: 'BANK_TRANSFER',
      transaction_code: 'TXN_' + (Date.now() - 3 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Nạp bổ sung credit chiến dịch phỏng vấn AI',
      paid_at: getPastDate(3, 10),
      created_at: getPastDate(3, 10),
      updated_at: getPastDate(3, 10)
    },
    {
      user_id: 8, // Candidate Trần Thị C
      package_id: 2, // PRO
      amount: 99000,
      currency: 'VND',
      payment_method: 'MOMO',
      transaction_code: 'TXN_' + (Date.now() - 3 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Nâng cấp gói Hội viên PRO',
      paid_at: getPastDate(3, 14),
      created_at: getPastDate(3, 14),
      updated_at: getPastDate(3, 14)
    },

    // 2 days ago (Thứ Bảy)
    {
      user_id: 5, // HR GreenEnergy
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + (Date.now() - 2 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Nâng cấp gói Business 5.000 Credit',
      paid_at: getPastDate(2, 9),
      created_at: getPastDate(2, 9),
      updated_at: getPastDate(2, 9)
    },
    {
      user_id: 6, // HR FastFinance
      package_id: 8, // PRO
      amount: 799000,
      currency: 'VND',
      payment_method: 'BANK_TRANSFER',
      transaction_code: 'TXN_' + (Date.now() - 2 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Thanh toán nâng cấp gói PRO 1.000 Credit',
      paid_at: getPastDate(2, 16),
      created_at: getPastDate(2, 16),
      updated_at: getPastDate(2, 16)
    },

    // 1 day ago (Chủ Nhật)
    {
      user_id: 7, // HR SmartEdu
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + (Date.now() - 1 * 86400000) + '_1',
      status: 'COMPLETED',
      notes: 'Nạp gói Business 5.000 Credit',
      paid_at: getPastDate(1, 11),
      created_at: getPastDate(1, 11),
      updated_at: getPastDate(1, 11)
    },
    {
      user_id: 4, // HR VinaGroup
      package_id: 8, // PRO
      amount: 799000,
      currency: 'VND',
      payment_method: 'MOMO',
      transaction_code: 'TXN_' + (Date.now() - 1 * 86400000) + '_2',
      status: 'COMPLETED',
      notes: 'Nạp thêm 1.000 Credit cho đợt tuyển dụng quý 3',
      paid_at: getPastDate(1, 15),
      created_at: getPastDate(1, 15),
      updated_at: getPastDate(1, 15)
    },

    // Today (Thứ Hai)
    {
      user_id: 3, // HR TechCorp
      package_id: 9, // BUSINESS
      amount: 2499000,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: 'TXN_' + Date.now() + '_1',
      status: 'COMPLETED',
      notes: 'Nạp gói Business 5.000 Credit tự động',
      paid_at: getPastDate(0, 8),
      created_at: getPastDate(0, 8),
      updated_at: getPastDate(0, 8)
    },
    {
      user_id: 2, // Candidate
      package_id: 4, // VIP
      amount: 199000,
      currency: 'VND',
      payment_method: 'MOMO',
      transaction_code: 'TXN_' + Date.now() + '_2',
      status: 'COMPLETED',
      notes: 'Gia hạn gói Hội viên VIP 1 tháng',
      paid_at: getPastDate(0, 10),
      created_at: getPastDate(0, 10),
      updated_at: getPastDate(0, 10)
    }
  ];

  await knex('transactions').insert(sampleTransactions);

  // Reset sequences
  await knex.raw("SELECT setval(pg_get_serial_sequence('packages', 'id'), COALESCE((SELECT MAX(id) FROM packages), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('transactions', 'id'), COALESCE((SELECT MAX(id) FROM transactions), 1))");
}