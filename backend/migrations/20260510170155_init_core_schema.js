/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Bảng Jobs (Dành cho Module của Khánh & Sang)
  await knex.schema.createTable('jobs', (table) => {
    table.increments('id').primary();
    table.integer('hr_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.text('requirements'); // AI dùng cái này để đặt câu hỏi kiến thức
    table.string('status').defaultTo('OPEN'); // OPEN, CLOSED
    table.timestamps(true, true);
  });

  // 2. Bảng CVs (Dành cho Module của Huy & Khánh)
  await knex.schema.createTable('cvs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('file_url');
    table.text('parsed_text');
    table.integer('ats_score');
    table.text('ai_feedback'); // Nhận xét tổng quan và gợi ý chỉnh sửa
    table.timestamps(true, true);
  });

  // 3. Bảng Interviews (Dành cho Module của Quân & Phương)
  await knex.schema.createTable('interviews', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('cv_id').unsigned().references('id').inTable('cvs').onDelete('SET NULL');
    table.integer('job_id').unsigned().references('id').inTable('jobs').onDelete('SET NULL');
    table.string('type').notNullable().defaultTo('PRACTICE'); // PRACTICE (Phương), REAL (Quân)
    table.string('status').defaultTo('PENDING'); // PENDING, IN_PROGRESS, COMPLETED
    table.timestamp('started_at');
    table.timestamp('ended_at');
    table.timestamps(true, true);
  });


  // 5. Bảng Assessments (Dành cho Module của Huy & Phương)
  await knex.schema.createTable('assessments', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().references('id').inTable('interviews').onDelete('CASCADE').unique();
    table.integer('overall_score');
    table.text('feedback_summary');
    table.jsonb('learning_path'); // Lộ trình luyện tập AI gợi ý
    table.timestamps(true, true);
  });

  // 6. Bảng Question Bank (Dành cho Module của Sang)
  await knex.schema.createTable('question_bank', (table) => {
    table.increments('id').primary();
    table.integer('job_id').unsigned().references('id').inTable('jobs').onDelete('CASCADE'); // Câu hỏi mẫu theo Job
    table.string('category'); // Kỹ năng chuyên môn, Câu hỏi tình huống...
    table.text('content').notNullable();
    table.text('expected_answer');
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('question_bank');
  await knex.schema.dropTableIfExists('assessments');
  await knex.schema.dropTableIfExists('code_submissions'); // Thêm dòng này để xóa bảng cũ

  await knex.schema.dropTableIfExists('interviews');
  await knex.schema.dropTableIfExists('cvs');
  await knex.schema.dropTableIfExists('jobs');
}
