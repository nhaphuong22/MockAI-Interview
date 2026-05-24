import db from '../db/knex.js';

/**
 * Initialize a new interview and generate dynamic questions based on CV + Position + Skills
 * 
 * @param {object} params
 * @param {number} params.userId - Candidate User ID
 * @param {number} [params.jobId] - Optional Job ID being applied to
 * @param {string} [params.customPosition] - Selected position title (if PRACTICE)
 * @param {string} [params.customSkills] - Comma-separated skills list (if PRACTICE)
 * @param {string} [params.experienceLevel] - Selected experience level
 * @param {string} [params.type] - PRACTICE or REAL
 * @returns {Promise<object>} The created interview record with generated questions
 */
export const initInterviewSession = async ({
  userId,
  jobId = null,
  customPosition = '',
  customSkills = '',
  experienceLevel = 'JUNIOR',
  type = 'PRACTICE'
}) => {
  // 1. Create the interview record
  const [interview] = await db('interviews')
    .insert({
      user_id: userId,
      job_id: jobId,
      custom_position: customPosition || null,
      custom_skills: customSkills || null,
      experience_level: experienceLevel || null,
      type: type,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');

  // 2. Generate customized interview questions based on the target position & skills
  const questions = generateDynamicQuestions(customPosition, customSkills, experienceLevel);

  // 3. Save questions to interview_questions table
  const questionsToInsert = questions.map((qText, index) => ({
    interview_id: interview.id,
    question_text: qText,
    expected_answer: `Phản hồi mẫu cho câu hỏi về ${customPosition || 'Kỹ năng chung'}`,
    score_weight: 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const insertedQuestions = await db('interview_questions')
    .insert(questionsToInsert)
    .returning('*');

  return {
    ...interview,
    questions: insertedQuestions
  };
};

/**
 * Generate 5 dynamic, professional interview questions based on context
 */
function generateDynamicQuestions(position = '', skills = '', level = 'JUNIOR') {
  const normPosition = position.toLowerCase();
  const normSkills = skills.toLowerCase();

  // A. Frontend Developer questions
  if (normPosition.includes('front') || normPosition.includes('react') || normPosition.includes('vue')) {
    return [
      `Với vị trí ${position} (${level}), bạn có thể giải thích cơ chế rendering (SSR, CSR, SSG) khác nhau như thế nào và khi nào nên chọn loại nào?`,
      `Khi làm việc với các thư viện quản lý State như Redux hoặc Zustand, bạn làm cách nào để tránh re-render không cần thiết và tối ưu hóa hiệu năng?`,
      `Bạn xử lý các bất đồng bộ (async/await) trong Javascript/React thế nào? Làm sao để xử lý lỗi (error boundary/try-catch) triệt để?`,
      `Hãy mô tả cách bạn tối ưu hóa tốc độ tải trang (Core Web Vitals) cho một ứng dụng Web lớn?`,
      `Dựa trên kỹ năng ${skills || 'Frontend'} của bạn, hãy kể về một lỗi UI/Performance phức tạp bạn từng gặp và cách bạn debug nó?`
    ];
  }

  // B. Backend Developer questions
  if (normPosition.includes('back') || normPosition.includes('node') || normPosition.includes('api') || normPosition.includes('python')) {
    return [
      `Tại sao bạn lại chọn xây dựng kiến trúc RESTful thay vì GraphQL trong một hệ thống cần bảo mật cao?`,
      `Bạn tối ưu hóa các câu lệnh SQL hoặc cơ chế Indexing thế nào khi gặp các bảng dữ liệu lớn hàng triệu dòng?`,
      `Mô tả cơ chế xác thực JWT và cách bạn quản lý Refresh Token an toàn trên Production để chống XSS/CSRF?`,
      `Làm thế nào để bạn xử lý Race Condition khi có hàng nghìn lượt mua hàng đồng thời trong hệ thống thương mại điện tử?`,
      `Hãy giải thích cách bạn áp dụng kỹ năng ${skills || 'NodeJS/Express'} để xây dựng cấu trúc API dễ mở rộng và bảo trì?`
    ];
  }

  // C. General / Other Technical Positions
  return [
    `Hãy giới thiệu ngắn gọn về một dự án phần mềm bạn từng xây dựng sử dụng kỹ năng ${skills || 'lập trình'}?`,
    `Để đảm bảo chất lượng code trong team, quy trình kiểm thử (Unit Test/E2E) và review code của bạn diễn ra như thế nào?`,
    `Khi nhận được yêu cầu tính năng từ BA nhưng tài liệu mô tả còn mơ hồ, bạn sẽ xử lý như thế nào để làm rõ yêu cầu trước khi code?`,
    `Tại sao bạn nghĩ mình là ứng viên phù hợp nhất cho vị trí ${position || 'Lập trình viên'} cấp độ ${level}?`,
    `Hãy kể lại một lần bạn và đồng nghiệp bất đồng ý kiến về giải pháp kỹ thuật, và hai bạn đã thống nhất giải quyết ra sao?`
  ];
}
