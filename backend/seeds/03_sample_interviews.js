/**
 * Seed: Sample CV and Interview for testing.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Clear existing voice sessions, assessments, and messages that depend on interviews
  await knex('voice_sessions').del();
  await knex('assessments').del();
  await knex('interview_messages').del();
  
  // Clear interviews and cvs
  await knex('interviews').del();
  await knex('cvs').del();

  // Insert sample CV
  await knex('cvs').insert([
    {
      id: 1,
      user_id: 2, // 'user@mockai.com'
      file_url: 'https://mockai.com/uploads/sample-cv.pdf',
      parsed_text: 'Nguyen Van A, Frontend Developer with 2 years of experience in ReactJS, Tailwind CSS, JavaScript ES6+',
      ats_score: 85,
      ai_feedback: 'CV của bạn có cấu trúc tốt, tuy nhiên cần bổ sung thêm dự án thực tế về tối ưu hóa hiệu năng.',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert sample Interview (PRACTICE)
  await knex('interviews').insert([
    {
      id: 1,
      user_id: 2,
      cv_id: 1,
      job_id: 1, // Frontend Developer (React)
      type: 'PRACTICE',
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
