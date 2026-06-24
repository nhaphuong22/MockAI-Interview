/**
 * Seed: Sample CV and Interview for testing.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {

  // Clear existing voice sessions, assessments, and messages that depend on interviews
  await knex('applications').del();

  // Clear existing voice sessions and assessments that depend on interviews

  await knex('voice_sessions').del();
  await knex('assessments').del();
  
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
      ai_feedback: JSON.stringify({ semantic_score: 85, talent_signals: ['Có kinh nghiệm ReactJS', 'Biết Tailwind CSS'], red_flags: ['Cần bổ sung dự án thực tế về tối ưu hóa hiệu năng'], knockout_status: 'PASSED', matched_skills: ['ReactJS', 'Tailwind CSS', 'JavaScript ES6+'], missing_skills: [] }),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert sample Interview (REAL/PRACTICE)
  await knex('interviews').insert([
    {
      id: 1,
      user_id: 2,
      cv_id: 1,
      job_id: 1, // Frontend Developer (React)
      type: 'REAL',
      status: 'COMPLETED',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert sample Application
  await knex('applications').insert([
    {
      id: 1,
      candidate_id: 2, // 'user@mockai.com'
      job_id: 1, // Frontend Developer (React)
      cv_id: 1,
      interview_id: 1,
      status: 'AI_REVIEWED',
      cv_score: 85,
      interview_score: 78,
      total_score: 82,
      ai_summary: 'Ứng viên có kỹ năng React vững vàng, giao tiếp mạch lạc thông qua hội thoại thử nghiệm. Khuyên dùng: Hẹn gặp phỏng vấn trực tiếp.',
      hr_tag: 'POTENTIAL',
      hr_notes: 'Hồ sơ tiềm năng, CV đạt yêu cầu cơ bản và trả lời phỏng vấn AI ở mức Khá.',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('cvs_id_seq', (SELECT MAX(id) FROM cvs))");
  await knex.raw("SELECT setval('interviews_id_seq', (SELECT MAX(id) FROM interviews))");
  await knex.raw("SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications))");
};

