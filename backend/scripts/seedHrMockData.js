import db from '../src/db/knex.js';

async function seedHrMockData() {
  console.log('Bắt đầu nạp dữ liệu mẫu cho HR Dashboard...');

  try {
    // 1. Lấy HR đang đăng nhập (recruiter@mockai.com)
    const hr = await db('users')
      .where('email', 'recruiter@mockai.com')
      .first();

    if (!hr) {
      console.log('Không tìm thấy HR nào trong DB. Vui lòng tạo HR trước.');
      process.exit(1);
    }

    // 2. Lấy Job "Chuyên viên Marketing Online" hoặc Job đầu tiên
    let job = await db('jobs').where({ hr_id: hr.id, title: 'Chuyên viên Marketing Online' }).first();
    if (!job) {
      job = await db('jobs').where({ hr_id: hr.id }).first();
      console.log('Không tìm thấy Job Chuyên viên Marketing Online, sử dụng Job:', job.title);
    } else {
      console.log('Sử dụng Job có sẵn:', job.title);
    }

    // 3. Lấy 3 ứng viên (hoặc tạo giả)
    let candidates = await db('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('roles.name', 'USER')
      .select('users.*')
      .limit(3);

    if (candidates.length === 0) {
      console.log('Không có CANDIDATE nào trong DB. Tạo 3 ứng viên giả...');
      candidates = await db('users').insert([
        { full_name: 'Nguyễn Văn A', email: 'a@example.com', password_hash: '123' },
        { full_name: 'Trần Thị B', email: 'b@example.com', password_hash: '123' },
        { full_name: 'Lê Văn C', email: 'c@example.com', password_hash: '123' }
      ]).returning('*');
      
      const userRole = await db('roles').where({ name: 'USER' }).first();
      if (userRole) {
        const userRolesToInsert = candidates.map(c => ({ user_id: c.id, role_id: userRole.id }));
        await db('user_roles').insert(userRolesToInsert);
      }
    }

    // Dữ liệu mẫu đánh giá
    const mockEvaluations = [
      {
        score: 92,
        feedback: "Ứng viên trả lời xuất sắc, hiểu rõ bản chất React và có kinh nghiệm tối ưu hóa hiệu năng tốt.",
        radar: { Technical: 90, Communication: 85, ProblemSolving: 95, CultureFit: 90 }
      },
      {
        score: 75,
        feedback: "Ứng viên nắm được cơ bản nhưng chưa có nhiều kinh nghiệm xử lý state management ở quy mô lớn.",
        radar: { Technical: 70, Communication: 80, ProblemSolving: 75, CultureFit: 85 }
      },
      {
        score: 55,
        feedback: "Ứng viên thiếu nhiều kiến thức về Hooks và Lifecycle. Trả lời lúng túng khi gặp câu hỏi khó.",
        radar: { Technical: 50, Communication: 60, ProblemSolving: 55, CultureFit: 70 }
      }
    ];

    for (let i = 0; i < candidates.length && i < mockEvaluations.length; i++) {
      const candidate = candidates[i];
      const evalData = mockEvaluations[i];

      // 4. Tạo Interview
      const [interview] = await db('interviews').insert({
        user_id: candidate.id,
        job_id: job.id,
        type: 'REAL',
        status: 'COMPLETED',
        created_at: new Date(Date.now() - i * 86400000), // Lùi lại vài ngày
        updated_at: new Date()
      }).returning('*');

      // Tạo Assessment
      await db('assessments').insert({
        interview_id: interview.id,
        overall_score: evalData.score,
        feedback_summary: evalData.feedback,
        radar_skills: JSON.stringify(evalData.radar),
        created_at: interview.created_at,
        updated_at: new Date()
      });

      // Tạo câu hỏi và câu trả lời
      const [question] = await db('interview_questions').insert({
        interview_id: interview.id,
        question_text: "Bạn xử lý rò rỉ bộ nhớ (memory leak) trong React Hooks như thế nào?",
        expected_answer: "Sử dụng cleanup function trong useEffect để unsubscribe các event listener hoặc cancel các API request.",
        score_weight: 1,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      await db('candidate_answers').insert({
        interview_question_id: question.id,
        answer_text: i === 0 ? "Tôi dùng cleanup function trong useEffect để hủy event listener." : "Tôi không chắc lắm, có lẽ là reload trang.",
        score: i === 0 ? 95 : 50,
        ai_feedback: i === 0 ? "Tuyệt vời, câu trả lời chính xác." : "Sai căn bản.",
        created_at: new Date(),
        updated_at: new Date()
      });

      // 5. Link vào Application
      // Xóa application cũ nếu có để tránh conflict
      await db('applications').where({ candidate_id: candidate.id, job_id: job.id }).delete();

      await db('applications').insert({
        candidate_id: candidate.id,
        job_id: job.id,
        interview_id: interview.id,
        status: 'AI_REVIEWED',
        interview_score: evalData.score,
        total_score: evalData.score,
        ai_summary: evalData.feedback,
        created_at: interview.created_at,
        updated_at: new Date()
      });

      console.log(`Đã nạp hồ sơ cho ứng viên: ${candidate.full_name} - Điểm: ${evalData.score}`);
    }

    console.log('✅ Hoàn thành nạp dữ liệu mẫu!');
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

seedHrMockData();
