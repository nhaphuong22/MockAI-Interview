/**
 * Migration: Data Migration từ credit_batches sang hr_wallets và DROP TABLE credit_batches.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Data Migration:
  // Lấy danh sách ví hr_wallets
  const wallets = await knex('hr_wallets').select('id');
  
  for (const wallet of wallets) {
    // Tính tổng các lô credit còn hạn (amount_remaining) thuộc ví này
    const result = await knex('credit_batches')
      .where({ wallet_id: wallet.id })
      .where('expires_at', '>', knex.fn.now())
      .andWhere('amount_remaining', '>', 0)
      .sum('amount_remaining as total')
      .first();
      
    // Xử lý giá trị NULL: Nếu ví không có lô nào thì set total_credits = 0
    const totalCredits = parseInt(result?.total || 0) || 0;
    
    // Cập nhật số dư thực sự còn hạn vào hr_wallets
    await knex('hr_wallets')
      .where({ id: wallet.id })
      .update({
        total_credits: totalCredits,
        updated_at: new Date()
      });
  }

  // 2. Xóa bảng credit_batches khỏi DB
  await knex.schema.dropTableIfExists('credit_batches');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Khôi phục lại cấu trúc bảng credit_batches
  await knex.schema.createTable('credit_batches', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().references('id').inTable('hr_wallets').onDelete('CASCADE');
    table.integer('package_id').unsigned().references('id').inTable('packages').onDelete('SET NULL');
    table.integer('amount_granted').notNullable();
    table.integer('amount_remaining').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });
}
