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
  await knex('users').del();
  await knex('companies').del();

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('123456', salt);

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
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert base users
  await knex('users').insert([
    {
      id: 1, email: 'admin@mockai.com', password_hash: password_hash,
      full_name: 'Quản trị viên Hệ thống', email_verified: true,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 2, email: 'user@mockai.com', password_hash: password_hash,
      full_name: 'Ứng viên Thử nghiệm', email_verified: true,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 3, email: 'recruiter1@mockai.com', password_hash: password_hash,
      full_name: 'HR TechCorp', email_verified: true, company_id: 1,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 4, email: 'recruiter2@mockai.com', password_hash: password_hash,
      full_name: 'HR VinaGroup', email_verified: true, company_id: 2,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 5, email: 'recruiter3@mockai.com', password_hash: password_hash,
      full_name: 'HR GreenEnergy', email_verified: true, company_id: 3,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 6, email: 'recruiter4@mockai.com', password_hash: password_hash,
      full_name: 'HR FastFinance', email_verified: true, company_id: 4,
      created_at: new Date(), updated_at: new Date()
    },
    {
      id: 7, email: 'recruiter5@mockai.com', password_hash: password_hash,
      full_name: 'HR SmartEdu', email_verified: true, company_id: 5,
      created_at: new Date(), updated_at: new Date()
    }
  ]);

  // Insert Candidate Profiles
  await knex('candidate_profiles').insert([
    { user_id: 1, gender: 'MALE', created_at: new Date(), updated_at: new Date() },
    { user_id: 2, gender: 'MALE', created_at: new Date(), updated_at: new Date() }
  ]);

  // Insert HR Profiles
  const hrProfileData = {
    company_join_status: 'APPROVED',
    id_front_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Front',
    id_back_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Back',
    auth_letter_url: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+Auth+Letter',
    created_at: new Date(),
    updated_at: new Date()
  };

  await knex('hr_profiles').insert([
    { user_id: 3, ...hrProfileData },
    { user_id: 4, ...hrProfileData },
    { user_id: 5, ...hrProfileData },
    { user_id: 6, ...hrProfileData },
    { user_id: 7, ...hrProfileData }
  ]);

  // Insert HR Wallets cho các công ty (Unified Credits)
  await knex('hr_wallets').insert([
    { id: 1, company_id: 1, user_id: 3, total_credits: 500, created_at: new Date(), updated_at: new Date() },
    { id: 2, company_id: 2, user_id: 4, total_credits: 500, created_at: new Date(), updated_at: new Date() },
    { id: 3, company_id: 3, user_id: 5, total_credits: 500, created_at: new Date(), updated_at: new Date() },
    { id: 4, company_id: 4, user_id: 6, total_credits: 500, created_at: new Date(), updated_at: new Date() },
    { id: 5, company_id: 5, user_id: 7, total_credits: 500, created_at: new Date(), updated_at: new Date() }
  ]);

  // Insert Credit Batches (Unified - không phân biệt type)
  const creditBatchesData = [];
  for (let i = 1; i <= 5; i++) {
    creditBatchesData.push({ wallet_id: i, package_id: null, amount_granted: 500, amount_remaining: 500, expires_at: '2099-12-31 23:59:59', created_at: new Date(), updated_at: new Date() });
  }
  await knex('credit_batches').insert(creditBatchesData);

  // Cấp gói VIP thử nghiệm vĩnh viễn cho Ứng viên (user_id = 2)
  await knex('user_subscriptions').insert([
    { user_id: 2, package_id: null, start_date: new Date(), end_date: '2099-12-31 23:59:59', created_at: new Date(), updated_at: new Date() }
  ]);


  // Update creator_id for companies to link back to their respective HRs
  await knex('companies').where({ id: 1 }).update({ creator_id: 3 });
  await knex('companies').where({ id: 2 }).update({ creator_id: 4 });
  await knex('companies').where({ id: 3 }).update({ creator_id: 5 });
  await knex('companies').where({ id: 4 }).update({ creator_id: 6 });
  await knex('companies').where({ id: 5 }).update({ creator_id: 7 });

  // Query role ids to insert correct mappings
  const dbRoles = await knex('roles').select('id', 'name');
  const roleMap = dbRoles.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  // Link users to roles in user_roles table
  await knex('user_roles').insert([
    { user_id: 1, role_id: roleMap['ADMIN'], created_at: new Date(), updated_at: new Date() },
    { user_id: 2, role_id: roleMap['USER'], created_at: new Date(), updated_at: new Date() },
    { user_id: 3, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 4, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 5, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 6, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() },
    { user_id: 7, role_id: roleMap['HR'], created_at: new Date(), updated_at: new Date() }
  ]);

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
  await knex.raw("SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies))");
  await knex.raw("SELECT setval('hr_wallets_id_seq', (SELECT MAX(id) FROM hr_wallets))");
};
