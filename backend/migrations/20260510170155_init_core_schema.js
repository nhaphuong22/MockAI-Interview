/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Bảng CVs
  await knex.schema.createTable('cvs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('file_url');
    table.text('parsed_text');
    table.integer('ats_score');
    table.jsonb('missing_keywords');
    table.timestamps(true, true);
  });

  // Bảng Interviews (Phiên phỏng vấn)
  await knex.schema.createTable('interviews', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('cv_id').unsigned().references('id').inTable('cvs').onDelete('SET NULL');
    table.string('status').defaultTo('PENDING'); // PENDING, IN_PROGRESS, COMPLETED
    table.string('hr_style').defaultTo('FRIENDLY'); // FRIENDLY, PRESSURE
    table.timestamp('started_at');
    table.timestamp('ended_at');
    table.timestamps(true, true);
  });

  // Bảng Interview Messages (Transcript)
  await knex.schema.createTable('interview_messages', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().references('id').inTable('interviews').onDelete('CASCADE');
    table.string('role').notNullable(); // USER, AI
    table.text('content').notNullable();
    table.timestamps(true, true);
  });

  // Bảng Code Submissions (Khánh's Module)
  await knex.schema.createTable('code_submissions', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().references('id').inTable('interviews').onDelete('CASCADE');
    table.string('language').notNullable();
    table.text('code').notNullable();
    table.boolean('is_correct');
    table.text('ai_analysis');
    table.timestamps(true, true);
  });

  // Bảng Assessments (Huy's Module)
  await knex.schema.createTable('assessments', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().references('id').inTable('interviews').onDelete('CASCADE').unique(); // 1 bài phỏng vấn 1 đánh giá
    table.integer('professional_score');
    table.integer('logic_score');
    table.integer('confidence_score');
    table.integer('problem_solving_score');
    table.integer('culture_fit_score');
    table.text('feedback_summary');
    table.jsonb('learning_path');
    table.timestamps(true, true);
  });

  // Bảng Question Bank (Admin Module)
  await knex.schema.createTable('question_bank', (table) => {
    table.increments('id').primary();
    table.string('category').notNullable(); // VD: ReactJS, NodeJS, Behavioral
    table.text('content').notNullable();
    table.text('expected_answer');
    table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
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
  await knex.schema.dropTableIfExists('code_submissions');
  await knex.schema.dropTableIfExists('interview_messages');
  await knex.schema.dropTableIfExists('interviews');
  await knex.schema.dropTableIfExists('cvs');
}
