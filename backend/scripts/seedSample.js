import 'dotenv/config';
import db from '../src/db/knex.js';

const seedData = async () => {
  try {
    // Tìm ứng viên
    const candidate = await db('users').where({ email: 'user@mockai.com' }).first();
    // Tìm HR
    const hr = await db('users').where({ email: 'recruiter@mockai.com' }).first();
    
    if (!candidate || !hr) {
      console.log('Không tìm thấy tài khoản user@mockai.com hoặc recruiter@mockai.com. Vui lòng chạy pnpm run seed trước.');
      process.exit(1);
    }

    // Tìm công việc của HR
    let job = await db('jobs').where({ hr_id: hr.id }).first();
    if (!job) {
      const [insertedJob] = await db('jobs').insert({
        hr_id: hr.id,
        title: 'Frontend Developer React',
        description: 'Mock Job',
        requirements: 'React, Node',
        status: 'OPEN'
      }).returning('*');
      job = insertedJob;
    }

    // Xóa hồ sơ cũ của ứng viên với job này nếu có
    await db('applications').where({ candidate_id: candidate.id, job_id: job.id }).delete();

    // Tạo CV mẫu
    const [cv] = await db('cvs').insert({
      user_id: candidate.id,
      parsed_text: 'Kinh nghiệm 2 năm với React và Node.js.',
      ats_score: 85
    }).returning('*');

    // Tạo một bản ghi interview
    const [interview] = await db('interviews').insert({
      user_id: candidate.id,
      cv_id: cv.id,
      job_id: job.id,
      type: 'INTERVIEW',
      status: 'COMPLETED',
      started_at: new Date(),
      ended_at: new Date()
    }).returning('*');

    const sampleSummary = `**1. Nhận xét tổng quan:**
Ứng viên có thái độ tốt, mở đầu buổi phỏng vấn bằng lời chào lịch sự và chuyên nghiệp.

**2. Dự án trong CV:**
Trình bày rõ ràng về kinh nghiệm 2 năm với React. Nắm được luồng dữ liệu và State Management, tuy nhiên phần giải thích kiến trúc Redux còn lúng túng.

**3. Chuyên môn & Vị trí:**
Hiểu cơ bản về vòng đời React Component và Hooks. Điểm yếu lớn nhất là kỹ năng gỡ lỗi hệ thống (Debugging) chưa thực sự có chiều sâu thực chiến.

**4. Cảm ơn & Chào tạm biệt:**
Ứng viên đã chủ động gửi lời cảm ơn nhà tuyển dụng khi kết thúc.

**[CẢNH BÁO AI - VI PHẠM QUY CHẾ]:** 
Trong quá trình phỏng vấn, hệ thống phát hiện ứng viên đã **vi phạm 3 lần** (bao gồm hành vi chuyển sang thẻ trình duyệt khác và liếc mắt ra ngoài khung hình). Điều này cho thấy sự mất tập trung hoặc có dấu hiệu gian lận. Cần lưu ý đánh giá lại tính trung thực.`;

    // Tạo application mẫu
    await db('applications').insert({
      candidate_id: candidate.id,
      job_id: job.id,
      cv_id: cv.id,
      interview_id: interview.id,
      status: 'INTERVIEWED',
      cv_score: 85,
      interview_score: 65,
      ai_summary: sampleSummary,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Đã tạo thành công dữ liệu mẫu có Cảnh báo Vi phạm AI! Hãy vào trang HR (recruiter@mockai.com) để kiểm tra.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
    process.exit(1);
  }
};

seedData();
