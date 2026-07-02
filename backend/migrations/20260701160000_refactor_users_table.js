/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Tạo các bảng mới (Candidate Profiles, HR Profiles, HR Wallets, Credit Batches, User Subscriptions)
  
  await knex.schema.createTable('candidate_profiles', (table) => {
    table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE');
    table.string('phone');
    table.text('address');
    table.text('bio');
    table.string('gender');
    table.string('cover_url');
    table.string('id_card_number');
    table.boolean('is_looking_for_job').defaultTo(false);
    table.string('github_url');
    table.string('linkedin_url');
    table.string('portfolio_url');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('hr_profiles', (table) => {
    table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE');
    table.string('company_join_status').defaultTo('NONE'); // NONE, PENDING, APPROVED, REJECTED
    table.string('id_front_url');
    table.string('id_back_url');
    table.string('id_front_public_id');
    table.string('id_back_public_id');
    table.string('auth_letter_url');
    table.string('auth_letter_public_id');
    table.integer('company_rejected_id');
    table.timestamp('company_rejected_at');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('user_subscriptions', (table) => {
    table.integer('user_id').unsigned().primary().references('id').inTable('users').onDelete('CASCADE');
    table.integer('package_id').unsigned().references('id').inTable('packages').onDelete('SET NULL');
    table.timestamp('start_date').defaultTo(knex.fn.now());
    table.timestamp('end_date'); // vip_expiry
    table.timestamps(true, true);
  });

  // Tái tạo lại cấu trúc Ví Credit (Tránh xung đột thời hạn)
  await knex.schema.createTable('hr_wallets', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE'); // Freelance HR
    table.integer('total_job_credits').defaultTo(0);
    table.integer('total_ai_credits').defaultTo(0);
    table.timestamps(true, true);
    
    // Ràng buộc chỉ một trong hai (hoặc xử lý logic sau)
  });

  await knex.schema.createTable('credit_batches', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().references('id').inTable('hr_wallets').onDelete('CASCADE');
    table.integer('package_id').unsigned().references('id').inTable('packages').onDelete('SET NULL');
    table.string('credit_type').notNullable(); // JOB_POST, AI_INTERVIEW
    table.integer('amount_granted').notNullable();
    table.integer('amount_remaining').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });

  // 2. Chuyển Dữ Liệu (Data Transfer)
  const users = await knex('users').select('*');
  const candidateProfiles = [];
  const hrProfiles = [];
  const userSubs = [];

  for (const user of users) {
    if (user.role === 'USER' || user.role === 'CANDIDATE') {
      candidateProfiles.push({
        user_id: user.id,
        phone: user.phone || null,
        address: user.address || null,
        gender: user.gender || null,
        id_card_number: user.id_card_number || null,
        is_looking_for_job: user.is_looking_for_job || false,
        cover_url: user.cover_url || null,
        github_url: user.github_url || null,
        linkedin_url: user.linkedin_url || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      if (user.package_id || user.vip_expiry) {
        userSubs.push({
          user_id: user.id,
          package_id: user.package_id,
          end_date: user.vip_expiry,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    if (user.role === 'HR') {
      hrProfiles.push({
        user_id: user.id,
        company_join_status: user.company_join_status || 'NONE',
        id_front_url: user.id_front_url || null,
        id_back_url: user.id_back_url || null,
        id_front_public_id: user.id_front_public_id || null,
        id_back_public_id: user.id_back_public_id || null,
        auth_letter_url: user.auth_letter_url || null,
        auth_letter_public_id: user.auth_letter_public_id || null,
        company_rejected_id: user.company_rejected_id || null,
        company_rejected_at: user.company_rejected_at || null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  // Insert theo batch (để tránh lỗi timeout nếu data lớn)
  if (candidateProfiles.length > 0) await knex.batchInsert('candidate_profiles', candidateProfiles);
  if (hrProfiles.length > 0) await knex.batchInsert('hr_profiles', hrProfiles);
  if (userSubs.length > 0) await knex.batchInsert('user_subscriptions', userSubs);

  // Migration ví Credit cho Company 
  // ... phần logic này sẽ được mở rộng trong tương lai. Tạm thời chúng ta tập trung drop columns rác của users.

  // 3. Drop Cột Rác ở bảng Users
  await knex.schema.alterTable('users', (table) => {
    // Drop các cột thuộc Candidate Profile
    table.dropColumn('phone');
    table.dropColumn('address');
    table.dropColumn('bio');
    table.dropColumn('gender');
    table.dropColumn('cover_url');
    table.dropColumn('id_card_number');
    table.dropColumn('is_looking_for_job');
    table.dropColumn('github_url');
    table.dropColumn('linkedin_url');
    
    // Drop các cột thuộc HR Profile
    table.dropColumn('company_join_status');
    table.dropColumn('id_front_url');
    table.dropColumn('id_back_url');
    table.dropColumn('id_front_public_id');
    table.dropColumn('id_back_public_id');
    table.dropColumn('auth_letter_url');
    table.dropColumn('auth_letter_public_id');
    table.dropColumn('company_rejected_id');
    table.dropColumn('company_rejected_at');

    // Drop các cột liên quan đến gói/Credit (Vì đã chuyển qua User_subscriptions và HR_wallets)
    table.dropColumn('package_id');
    table.dropColumn('vip_expiry');
    // Lưu ý: Nếu có trường job_post_credits ở users do tính năng cũ, có thể drop luôn.
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // 1. Phục hồi các cột đã xóa (Rất khó để phục hồi Data)
  await knex.schema.alterTable('users', (table) => {
    table.string('phone');
    table.text('address');
    table.text('bio');
    table.string('gender');
    table.string('cover_url');
    table.string('id_card_number');
    table.boolean('is_looking_for_job');
    table.string('github_url');
    table.string('linkedin_url');
    
    table.string('company_join_status');
    table.string('id_front_url');
    table.string('id_back_url');
    table.string('id_front_public_id');
    table.string('id_back_public_id');
    table.string('auth_letter_url');
    table.string('auth_letter_public_id');
    table.integer('company_rejected_id');
    table.timestamp('company_rejected_at');

    table.integer('package_id');
    table.timestamp('vip_expiry');
  });

  // 2. Drop các bảng mới
  await knex.schema.dropTableIfExists('credit_batches');
  await knex.schema.dropTableIfExists('hr_wallets');
  await knex.schema.dropTableIfExists('user_subscriptions');
  await knex.schema.dropTableIfExists('hr_profiles');
  await knex.schema.dropTableIfExists('candidate_profiles');
};
