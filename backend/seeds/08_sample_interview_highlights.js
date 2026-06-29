/**
 * Seed: Sample Interview Highlights for testing.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear existing highlights
  await knex('interview_highlights').del();

  // Clear specific mock records to avoid primary key conflicts on duplicate run
  await knex('applications').where('id', 2).del();
  await knex('voice_sessions').where('interview_id', 2).del();
  await knex('assessments').where('interview_id', 2).del();
  await knex('interviews').where('id', 2).del();

  // Insert suspended Interview for fraud mockup testing (interview_id: 2)
  // Linked to job_id: 3 to avoid (candidate_id, job_id) unique constraint violation
  await knex('interviews').insert([
    {
      id: 2,
      user_id: 2, // 'user@mockai.com'
      cv_id: 1,
      job_id: 3, // Kỹ sư Năng lượng Mặt trời
      type: 'REAL',
      status: 'SUSPENDED',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert suspended Application (application_id: 2)
  await knex('applications').insert([
    {
      id: 2,
      candidate_id: 2,
      job_id: 3, // Kỹ sư Năng lượng Mặt trời
      cv_id: 1,
      interview_id: 2,
      status: 'FLAGGED_FRAUD',
      cv_score: 85,
      interview_score: 0,
      total_score: 42,
      ai_summary: 'Hồ sơ bị cảnh báo đỏ do phát hiện vi phạm quy chế phỏng vấn nghiêm trọng.',
      hr_tag: 'REJECTED',
      hr_notes: 'Hệ thống tự động đánh dấu FLAGGED_FRAUD do ứng viên có hơn 5 lần vi phạm chuyển tab và hướng nhìn.',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert interview highlights
  await knex('interview_highlights').insert([
    {
      id: 1,
      interview_id: 1,
      highlight_summary: 'Ứng viên có phong thái trả lời tự tin, kỹ năng chuyên môn React tốt. Có một số giây ngập ngừng nhẹ ở câu hỏi thứ 2 nhưng nhanh chóng lấy lại bình tĩnh. Tổng thể thể hiện xuất sắc, giao tiếp trôi chảy và mạch lạc.',
      is_flagged: false,
      timestamps_data: JSON.stringify([
        {
          timestamp: 15,
          label: 'Trả lời xuất sắc về tối ưu hóa React.useMemo và useCallback',
          duration: 30,
          type: 'STRENGTH'
        },
        {
          timestamp: 45,
          label: 'Khoảnh khắc ngập ngừng khi giải thích về useEffect clean-up function',
          duration: 15,
          type: 'HESITATION'
        },
        {
          timestamp: 120,
          label: 'Thể hiện tư duy thiết kế component tốt và hiểu sâu về State Management',
          duration: 30,
          type: 'STRENGTH'
        }
      ]),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      interview_id: 2,
      highlight_summary: 'Hệ thống đã tự động đình chỉ buổi phỏng vấn này sau khi phát hiện vượt quá 5 lần vi phạm quy chế thi cử. Ứng viên liên tục chuyển tab trình duyệt và hướng nhìn rời khỏi màn hình camera chính.',
      is_flagged: true,
      timestamps_data: JSON.stringify([
        {
          timestamp: 30,
          label: 'Phát hiện chuyển tab trình duyệt lần 1 (Cảnh báo)',
          duration: 10,
          type: 'VIOLATION'
        },
        {
          timestamp: 75,
          label: 'Ứng viên rời mắt khỏi màn hình quá lâu (Gaze Violation)',
          duration: 15,
          type: 'VIOLATION'
        },
        {
          timestamp: 110,
          label: 'Ứng viên liên tục chuyển tab trình duyệt nhiều lần (Hủy tư cách)',
          duration: 30,
          type: 'VIOLATION'
        }
      ]),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('interviews_id_seq', (SELECT MAX(id) FROM interviews))");
  await knex.raw("SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications))");
  await knex.raw("SELECT setval('interview_highlights_id_seq', (SELECT MAX(id) FROM interview_highlights))");
}
