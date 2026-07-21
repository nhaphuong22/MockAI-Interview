import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes all tables to start fresh
  await knex('job_requirements').del();
  await knex('applications').del();
  await knex('voice_sessions').del();
  await knex('assessments').del();
  await knex('interviews').del();
  await knex('cvs').del();
  await knex('blogs').del();
  await knex('jobs').del();
  await knex('user_roles').del();
  await knex('leaderboard_scores').del();
  await knex('daily_streaks').del();
  await knex('daily_questions').del();
  await knex('users').del();
  await knex('companies').del();

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('123456', salt);

  const now = new Date();
  const getPastDate = (daysAgo, hours = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, 0, 0, 0);
    return d;
  };

  // Insert sample companies with APPROVED status
  await knex('companies').insert([
    {
      id: 1,
      name: 'TechCorp Vietnam',
      logo_url: '💻',
      website: 'techcorp.vn',
      industry: 'Công nghệ thông tin',
      company_size: '150-200',
      description: 'Công ty công nghệ hàng đầu chuyên về phát triển Web và AI.',
      city: 'Hà Nội',
      address: 'Hà Nội',
      phone: '024123456',
      email: 'contact@techcorp.vn',
      tax_code: '0101234567',
      verification_status: 'APPROVED',
      created_at: getPastDate(6),
      updated_at: getPastDate(6)
    },
    {
      id: 2,
      name: 'VinaGroup',
      logo_url: '🏢',
      website: 'vinagroup.com',
      industry: 'Đa ngành',
      company_size: '500+',
      description: 'Tập đoàn kinh tế tư nhân đa ngành hàng đầu Việt Nam.',
      city: 'TP.HCM',
      address: 'TP. Hồ Chí Minh',
      phone: '028123456',
      email: 'contact@vinagroup.com',
      tax_code: '0201234567',
      verification_status: 'APPROVED',
      created_at: getPastDate(5),
      updated_at: getPastDate(5)
    },
    {
      id: 3,
      name: 'GreenEnergy',
      logo_url: '🌱',
      website: 'greenenergy.com',
      industry: 'Năng lượng sạch',
      company_size: '51-200',
      description: 'Cung cấp giải pháp năng lượng mặt trời và năng lượng tái tạo.',
      city: 'Đà Nẵng',
      address: 'Đà Nẵng',
      phone: '0236123456',
      email: 'contact@greenenergy.com',
      tax_code: '0301234567',
      verification_status: 'APPROVED',
      created_at: getPastDate(4),
      updated_at: getPastDate(4)
    },
    {
      id: 4,
      name: 'FastFinance',
      logo_url: '🏦',
      website: 'fastfinance.com',
      industry: 'Tài chính / Ngân hàng',
      company_size: '201-500',
      description: 'Ứng dụng giải pháp công nghệ số trong lĩnh vực tài chính tiêu dùng.',
      city: 'Hà Nội',
      address: 'TP. Hồ Chí Minh',
      phone: '028987654',
      email: 'contact@fastfinance.com',
      tax_code: '0401234567',
      verification_status: 'APPROVED',
      created_at: getPastDate(3),
      updated_at: getPastDate(3)
    },
    {
      id: 5,
      name: 'SmartEdu',
      logo_url: '🎓',
      website: 'smartedu.vn',
      industry: 'Giáo dục / EdTech',
      company_size: '11-50',
      description: 'Cung cấp nền tảng học trực tuyến chất lượng cao dành cho học sinh.',
      city: 'TP.HCM',
      address: 'Hà Nội',
      phone: '024987654',
      email: 'contact@smartedu.vn',
      tax_code: '0501234567',
      verification_status: 'APPROVED',
      created_at: getPastDate(2),
      updated_at: getPastDate(2)
    }
  ]);

  // Insert users spread across 7 days
  await knex('users').insert([
    {
      id: 1, email: 'admin@mockai.com', password_hash: password_hash,
      full_name: 'Quản trị viên Hệ thống', email_verified: true,
      created_at: getPastDate(6), updated_at: getPastDate(6)
    },
    {
      id: 2, email: 'user@mockai.com', password_hash: password_hash,
      full_name: 'Nguyễn Hoàng Nam', email_verified: true,
      created_at: getPastDate(6), updated_at: getPastDate(6)
    },
    {
      id: 3, email: 'recruiter1@mockai.com', password_hash: password_hash,
      full_name: 'Phạm Thanh Sơn', email_verified: true, company_id: 1,
      created_at: getPastDate(6), updated_at: getPastDate(6)
    },
    {
      id: 4, email: 'recruiter2@mockai.com', password_hash: password_hash,
      full_name: 'Lê Thị Nguyệt', email_verified: true, company_id: 2,
      created_at: getPastDate(5), updated_at: getPastDate(5)
    },
    {
      id: 5, email: 'recruiter3@mockai.com', password_hash: password_hash,
      full_name: 'Trần Quốc Tuấn', email_verified: true, company_id: 3,
      created_at: getPastDate(4), updated_at: getPastDate(4)
    },
    {
      id: 6, email: 'recruiter4@mockai.com', password_hash: password_hash,
      full_name: 'Đặng Minh Châu', email_verified: true, company_id: 4,
      created_at: getPastDate(3), updated_at: getPastDate(3)
    },
    {
      id: 7, email: 'recruiter5@mockai.com', password_hash: password_hash,
      full_name: 'Vũ Hoàng Long', email_verified: true, company_id: 5,
      created_at: getPastDate(2), updated_at: getPastDate(2)
    },

    // 15 Additional Candidates with REAL Vietnamese Names
    {
      id: 8, email: 'candidate1@mockai.com', password_hash: password_hash,
      full_name: 'Trần Thị Mai', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(5, 14), updated_at: getPastDate(5, 14)
    },
    {
      id: 9, email: 'candidate2@mockai.com', password_hash: password_hash,
      full_name: 'Lê Quốc Bảo', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(4, 9), updated_at: getPastDate(4, 9)
    },
    {
      id: 10, email: 'candidate3@mockai.com', password_hash: password_hash,
      full_name: 'Phạm Nhật Minh', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(4, 16), updated_at: getPastDate(4, 16)
    },
    {
      id: 11, email: 'candidate4@mockai.com', password_hash: password_hash,
      full_name: 'Hoàng Đức Thắng', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(3, 11), updated_at: getPastDate(3, 11)
    },
    {
      id: 12, email: 'candidate5@mockai.com', password_hash: password_hash,
      full_name: 'Vũ Thị Ngọc Anh', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(2, 10), updated_at: getPastDate(2, 10)
    },
    {
      id: 13, email: 'candidate6@mockai.com', password_hash: password_hash,
      full_name: 'Đặng Văn Khoa', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(1, 15), updated_at: getPastDate(1, 15)
    },
    {
      id: 14, email: 'candidate7@mockai.com', password_hash: password_hash,
      full_name: 'Ngô Thị Phương Thảo', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(1, 18), updated_at: getPastDate(1, 18)
    },
    {
      id: 15, email: 'candidate8@mockai.com', password_hash: password_hash,
      full_name: 'Bùi Anh Tuấn', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 9), updated_at: getPastDate(0, 9)
    },
    {
      id: 16, email: 'candidate9@mockai.com', password_hash: password_hash,
      full_name: 'Đỗ Thanh Tùng', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 10), updated_at: getPastDate(0, 10)
    },
    {
      id: 17, email: 'candidate10@mockai.com', password_hash: password_hash,
      full_name: 'Phan Hoàng Yến', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 11), updated_at: getPastDate(0, 11)
    },
    {
      id: 18, email: 'candidate11@mockai.com', password_hash: password_hash,
      full_name: 'Dương Minh Triết', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 12), updated_at: getPastDate(0, 12)
    },
    {
      id: 19, email: 'candidate12@mockai.com', password_hash: password_hash,
      full_name: 'Lý Gia Huy', avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 13), updated_at: getPastDate(0, 13)
    },
    {
      id: 20, email: 'candidate13@mockai.com', password_hash: password_hash,
      full_name: 'Trịnh Hồng Nhung', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 14), updated_at: getPastDate(0, 14)
    },
    {
      id: 21, email: 'candidate14@mockai.com', password_hash: password_hash,
      full_name: 'Võ Thành Đạt', avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 15), updated_at: getPastDate(0, 15)
    },
    {
      id: 22, email: 'candidate15@mockai.com', password_hash: password_hash,
      full_name: 'Nguyễn Khánh Hà', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', email_verified: true,
      created_at: getPastDate(0, 16), updated_at: getPastDate(0, 16)
    }
  ]);

  // Insert Candidate Profiles
  const candidateProfileList = [];
  for (let uId = 1; uId <= 22; uId++) {
    candidateProfileList.push({
      user_id: uId,
      gender: uId % 2 === 0 ? 'FEMALE' : 'MALE',
      created_at: now,
      updated_at: now
    });
  }
  await knex('candidate_profiles').insert(candidateProfileList);

  // Insert HR Profiles
  const hrProfileData = {
    company_join_status: 'APPROVED',
    id_front_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Front',
    id_back_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Back',
    auth_letter_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+Auth+Letter',
    created_at: now,
    updated_at: now
  };

  await knex('hr_profiles').insert([
    { user_id: 3, ...hrProfileData },
    { user_id: 4, ...hrProfileData },
    { user_id: 5, ...hrProfileData },
    { user_id: 6, ...hrProfileData },
    { user_id: 7, ...hrProfileData }
  ]);

  // Insert HR Wallets
  await knex('hr_wallets').insert([
    { id: 1, company_id: 1, user_id: null, total_credits: 500, created_at: now, updated_at: now },
    { id: 2, company_id: 2, user_id: null, total_credits: 500, created_at: now, updated_at: now },
    { id: 3, company_id: 3, user_id: null, total_credits: 500, created_at: now, updated_at: now },
    { id: 4, company_id: 4, user_id: null, total_credits: 500, created_at: now, updated_at: now },
    { id: 5, company_id: 5, user_id: null, total_credits: 500, created_at: now, updated_at: now },
    { id: 6, company_id: null, user_id: 3, total_credits: 50, created_at: now, updated_at: now },
    { id: 7, company_id: null, user_id: 4, total_credits: 50, created_at: now, updated_at: now },
    { id: 8, company_id: null, user_id: 5, total_credits: 50, created_at: now, updated_at: now },
    { id: 9, company_id: null, user_id: 6, total_credits: 50, created_at: now, updated_at: now },
    { id: 10, company_id: null, user_id: 7, total_credits: 50, created_at: now, updated_at: now }
  ]);

  // VIP Subscriptions
  await knex('user_subscriptions').insert([
    { user_id: 2, package_id: null, start_date: now, end_date: '2099-12-31 23:59:59', created_at: now, updated_at: now }
  ]);

  // Update creator_id for companies
  await knex('companies').where({ id: 1 }).update({ creator_id: 3 });
  await knex('companies').where({ id: 2 }).update({ creator_id: 4 });
  await knex('companies').where({ id: 3 }).update({ creator_id: 5 });
  await knex('companies').where({ id: 4 }).update({ creator_id: 6 });
  await knex('companies').where({ id: 5 }).update({ creator_id: 7 });

  // Query roles
  const dbRoles = await knex('roles').select('id', 'name');
  const roleMap = dbRoles.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  // Link users to roles
  const userRolesData = [
    { user_id: 1, role_id: roleMap['ADMIN'], created_at: now, updated_at: now },
    { user_id: 2, role_id: roleMap['USER'], created_at: now, updated_at: now },
    { user_id: 3, role_id: roleMap['HR'], created_at: now, updated_at: now },
    { user_id: 4, role_id: roleMap['HR'], created_at: now, updated_at: now },
    { user_id: 5, role_id: roleMap['HR'], created_at: now, updated_at: now },
    { user_id: 6, role_id: roleMap['HR'], created_at: now, updated_at: now },
    { user_id: 7, role_id: roleMap['HR'], created_at: now, updated_at: now },
  ];

  for (let uId = 8; uId <= 15; uId++) {
    userRolesData.push({
      user_id: uId,
      role_id: roleMap['USER'],
      created_at: now,
      updated_at: now
    });
  }

  await knex('user_roles').insert(userRolesData);

  // Reset sequences
  await knex.raw("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('companies', 'id'), COALESCE((SELECT MAX(id) FROM companies), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('hr_wallets', 'id'), COALESCE((SELECT MAX(id) FROM hr_wallets), 1))");
}
