/**
 * Seed: Demo Application for User 2 into Senior React Developer position.
 * CV Passed, Interview Passed, Application status is SHORTLISTED.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // 1. CLEANUP PREVIOUS DEMO DATA TO ENSURE IDEMPOTENCY
  // Get all interviews of user 2 for job 1
  const existingInterviews = await knex('interviews')
    .where({ user_id: 2, job_id: 1 })
    .select('id');
  const interviewIds = existingInterviews.map(i => i.id);

  if (interviewIds.length > 0) {
    // Delete applications referencing these interviews
    await knex('applications').whereIn('interview_id', interviewIds).del();
    
    // Delete highlights
    await knex('interview_highlights').whereIn('interview_id', interviewIds).del();
    
    // Delete assessments
    await knex('assessments').whereIn('interview_id', interviewIds).del();

    // Delete candidate answers
    const questions = await knex('interview_questions')
      .whereIn('interview_id', interviewIds)
      .select('id');
    const questionIds = questions.map(q => q.id);
    
    if (questionIds.length > 0) {
      await knex('candidate_answers').whereIn('interview_question_id', questionIds).del();
      await knex('interview_questions').whereIn('id', questionIds).del();
    }
    
    // Delete voice sessions
    await knex('voice_sessions').whereIn('interview_id', interviewIds).del();

    // Delete interviews
    await knex('interviews').whereIn('id', interviewIds).del();
  }

  // Delete any other application of user 2 to job 1
  await knex('applications').where({ candidate_id: 2, job_id: 1 }).del();

  // Get all CVs of user 2 that might have been created for this demo
  const existingCvs = await knex('cvs')
    .where({ user_id: 2, file_url: 'https://mockai.com/uploads/demo-react-cv.pdf' })
    .select('id');
  const cvIds = existingCvs.map(c => c.id);
  
  if (cvIds.length > 0) {
    await knex('applications').whereIn('cv_id', cvIds).del();
    await knex('interviews').whereIn('cv_id', cvIds).update({ cv_id: null });
    await knex('cv_evaluations').whereIn('cv_id', cvIds).del();
    await knex('cv_skills').whereIn('cv_id', cvIds).del();
    await knex('cvs').whereIn('id', cvIds).del();
  }

  // 2. INSERT DEMO CV
  const [cvRow] = await knex('cvs').insert({
    user_id: 2, // Candidate
    file_url: 'https://mockai.com/uploads/demo-react-cv.pdf',
    parsed_text: 'Nguyen Van B, Senior Frontend Developer with 4 years of experience building high-performance React applications, styling with Tailwind CSS, and writing clean JavaScript/TypeScript. Experienced in Redux, Zustand, Next.js, and performance optimization.',
    ats_score: 92,
    ai_feedback: JSON.stringify({
      semantic_score: 92,
      talent_signals: [
        'Có hơn 3 năm kinh nghiệm lập trình ReactJS chuyên sâu',
        'Thành thạo Tailwind CSS và tối ưu hóa hiệu năng render',
        'Hiểu biết sâu về State Management (Zustand, Redux)'
      ],
      red_flags: [],
      knockout_status: 'PASSED',
      matched_skills: ['ReactJS', 'Tailwind CSS', 'Zustand', 'Next.js', 'JavaScript ES6+', 'TypeScript'],
      missing_skills: []
    }),
    pdf_report_url: 'https://mockai.com/reports/demo-react-cv-report.pdf',
    created_at: new Date(),
    updated_at: new Date()
  }).returning('id');

  const cvId = typeof cvRow === 'object' ? cvRow.id : cvRow;

  // Insert CV Skills
  await knex('cv_skills').insert([
    { cv_id: cvId, skill_name: 'ReactJS', experience_years: 4, created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, skill_name: 'Tailwind CSS', experience_years: 3, created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, skill_name: 'Zustand', experience_years: 2, created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, skill_name: 'JavaScript ES6+', experience_years: 4, created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, skill_name: 'Next.js', experience_years: 2, created_at: new Date(), updated_at: new Date() }
  ]);

  // Insert CV Evaluations
  await knex('cv_evaluations').insert([
    { cv_id: cvId, criterion_name: 'Technical Skills', score: 95, feedback: 'Kỹ năng Frontend xuất sắc, nắm vững các thư viện hiện đại như React, Zustand và Next.js.', created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, criterion_name: 'Work Experience', score: 90, feedback: '4 năm kinh nghiệm làm việc thực tế với các dự án lớn, có kinh nghiệm tối ưu hóa hiệu năng.', created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, criterion_name: 'Education', score: 85, feedback: 'Tốt nghiệp chuyên ngành CNTT, có nền tảng tư duy tốt.', created_at: new Date(), updated_at: new Date() },
    { cv_id: cvId, criterion_name: 'Soft Skills', score: 90, feedback: 'Khả năng trình bày vấn đề kỹ thuật rõ ràng, rành mạch qua CV.', created_at: new Date(), updated_at: new Date() }
  ]);

  // 3. INSERT INTERVIEW
  const [interviewRow] = await knex('interviews').insert({
    user_id: 2,
    cv_id: cvId,
    job_id: 1, // Senior React Developer
    type: 'REAL',
    status: 'COMPLETED',
    custom_position: 'Senior React Developer',
    custom_skills: 'ReactJS, Tailwind CSS, JavaScript ES6+',
    experience_level: 'SENIOR',
    started_at: new Date(Date.now() - 3600000), // 1 hour ago
    ended_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }).returning('id');

  const interviewId = typeof interviewRow === 'object' ? interviewRow.id : interviewRow;

  // 4. INSERT INTERVIEW QUESTIONS & ANSWERS
  const questionsData = [
    {
      question_text: 'Giải thích sự khác biệt giữa useMemo và useCallback trong React?',
      expected_answer: 'useMemo dùng để cache giá trị trả về của một hàm tính toán đắt đỏ, trong khi useCallback dùng để cache chính định nghĩa hàm để tránh tạo lại hàm con ở mỗi lần render.',
      score_weight: 1
    },
    {
      question_text: 'Tại sao không nên thay đổi state trực tiếp trong React?',
      expected_answer: 'Vì React dựa trên tính bất biến (immutability) để phát hiện sự thay đổi state thông qua so sánh tham chiếu. Nếu đột biến trực tiếp, React sẽ không kích hoạt quá trình re-render UI.',
      score_weight: 1
    },
    {
      question_text: 'Hãy trình bày các phương pháp tối ưu hiệu năng cho ứng dụng React lớn?',
      expected_answer: 'Sử dụng lazy loading và Suspense để chia nhỏ code, dùng React.memo cho component con, dùng useMemo/useCallback tránh tính toán dư thừa, và ảo hóa danh sách (windowing) cho list lớn.',
      score_weight: 1
    }
  ];

  const qaDetailsList = [];

  for (const q of questionsData) {
    const [qRow] = await knex('interview_questions').insert({
      interview_id: interviewId,
      question_text: q.question_text,
      expected_answer: q.expected_answer,
      score_weight: q.score_weight,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    const qId = typeof qRow === 'object' ? qRow.id : qRow;

    let answerText = '';
    let score = 90;
    let aiFeedback = '';

    if (q.question_text.includes('useMemo')) {
      answerText = 'useMemo dùng để lưu trữ giá trị tính toán được trả về từ một function để tránh việc tính toán lại vô ích trong các lần render tiếp theo nếu dependencies không thay đổi. Còn useCallback thì dùng để lưu trữ chính định nghĩa của một callback function, giúp tránh việc khởi tạo lại hàm đó, từ đó tránh việc các component con bị re-render không cần thiết khi nhận callback này làm props.';
      score = 92;
      aiFeedback = 'Câu trả lời cực kỳ chính xác và rõ ràng. Phân biệt tốt giữa việc cache giá trị tính toán và cache định nghĩa hàm. Thể hiện sự hiểu biết sâu sắc về tối ưu hóa render trong React.';
    } else if (q.question_text.includes('thay đổi state trực tiếp')) {
      answerText = 'Không nên thay đổi state trực tiếp vì React hoạt động dựa trên cơ chế so sánh tham chiếu cũ và mới để nhận biết thay đổi state. Nếu thay đổi trực tiếp (ví dụ state.value = x), tham chiếu của state không đổi, làm cho React không nhận biết được sự thay đổi để trigger hàm re-render, dẫn đến UI không cập nhật đúng.';
      score = 88;
      aiFeedback = 'Giải thích rất tốt về cơ chế hoạt động của React (Virtual DOM và so sánh tham chiếu). Đưa ra lý do thuyết phục về việc tại sao bất biến (immutability) lại quan trọng.';
    } else {
      answerText = 'Để tối ưu ứng dụng React lớn, chúng ta có thể sử dụng Code Splitting thông qua React.lazy và Suspense để giảm tải bundle ban đầu. Sử dụng React.memo để ngăn component con re-render không cần thiết. Áp dụng useMemo và useCallback cho các hàm phức tạp. Ngoài ra có thể sử dụng Virtualized Lists như react-window cho các danh sách lớn để tránh quá tải DOM.';
      score = 90;
      aiFeedback = 'Câu trả lời toàn diện, bao gồm cả tối ưu hoá code lẫn tối ưu hoá bundle size. Đề cập đến kỹ thuật quan trọng như Code Splitting và ảo hóa danh sách.';
    }

    await knex('candidate_answers').insert({
      interview_question_id: qId,
      answer_text: answerText,
      audio_url: 'https://mockai.com/uploads/audio-answer.mp3',
      ai_feedback: aiFeedback,
      score: score,
      created_at: new Date(),
      updated_at: new Date()
    });

    qaDetailsList.push({
      question: q.question_text,
      answer: answerText,
      score: score,
      feedback: aiFeedback
    });
  }

  // 5. INSERT ASSESSMENT
  const radarSkills = {
    technical_depth: 92,
    communication: 88,
    problem_solving: 90,
    confidence: 85,
    star_structure: 87
  };

  const learningPath = [
    {
      topic: 'React Performance Auditing',
      reason: 'Cần hiểu rõ cách sử dụng React DevTools Profiler để phân tích nguyên nhân re-render thực tế.',
      resources: ['React Official Docs - Profiler API', 'React Scan library overview']
    },
    {
      topic: 'TypeScript Advanced Types',
      reason: 'Bổ sung thêm TypeScript nâng cao để cải thiện Type-safe cho các React Components.',
      resources: ['TypeScript Deep Dive', 'React TypeScript Cheatsheet']
    }
  ];

  await knex('assessments').insert({
    interview_id: interviewId,
    overall_score: 88,
    feedback_summary: 'Ứng viên biểu diễn năng lực chuyên môn React xuất sắc. Các câu hỏi về useMemo/useCallback, cơ chế state immutability và các giải pháp tối ưu hóa hiệu năng hệ thống lớn được trả lời rất trôi chảy, rõ ràng và có chiều sâu lý thuyết kết hợp thực tiễn. Đề xuất: Đạt và chuyển tiếp sang phỏng vấn trực tiếp cùng Tech Lead.',
    learning_path: JSON.stringify(learningPath),
    radar_skills: JSON.stringify(radarSkills),
    qa_details: JSON.stringify(qaDetailsList),
    created_at: new Date(),
    updated_at: new Date()
  });

  // 6. INSERT INTERVIEW HIGHLIGHTS
  await knex('interview_highlights').insert({
    interview_id: interviewId,
    highlight_summary: 'Ứng viên có phản xạ trả lời nhanh, tự tin và giải thích cặn kẽ các khái niệm React chuyên sâu. Sử dụng từ ngữ chuyên ngành chính xác và trình bày rõ ràng.',
    is_flagged: false,
    timestamps_data: JSON.stringify([
      { timestamp: 10, label: 'Trình bày trôi chảy sự khác biệt useMemo và useCallback', duration: 40, type: 'STRENGTH' },
      { timestamp: 70, label: 'Giải thích cơ chế so sánh tham chiếu của React State chính xác', duration: 35, type: 'STRENGTH' },
      { timestamp: 120, label: 'Trình bày giải pháp Code Splitting và Virtual List cho React lớn', duration: 45, type: 'STRENGTH' }
    ]),
    created_at: new Date(),
    updated_at: new Date()
  });

  // 7. INSERT VOICE SESSION
  await knex('voice_sessions').insert({
    interview_id: interviewId,
    status: 'DISCONNECTED',
    duration_seconds: 350,
    recording_url: 'https://mockai.com/recordings/demo-react-interview.mp3',
    created_at: new Date(),
    updated_at: new Date()
  });

  // 8. INSERT APPLICATION
  await knex('applications').insert({
    candidate_id: 2,
    job_id: 1, // Senior React Developer (TechCorp)
    cv_id: cvId,
    interview_id: interviewId,
    status: 'SHORTLISTED', // Đạt kết quả và được duyệt vào danh sách rút gọn
    cv_score: 92,
    interview_score: 88,
    total_score: 90,
    ai_summary: 'Ứng viên sở hữu CV chuyên nghiệp đạt điểm ATS 92/100, kết hợp phỏng vấn AI đạt điểm xuất sắc 88/100. Kỹ năng ReactJS và tư duy tối ưu hóa hiệu năng rất vững vàng. Khuyên dùng: Phù hợp cao cho vị trí Senior React Developer.',
    hr_tag: 'SHORTLISTED',
    hr_notes: 'Dữ liệu mẫu nạp tự động: Ứng viên vượt qua cả 2 vòng quét CV và phỏng vấn thử nghiệm ảo. TechCorp đánh giá đạt.',
    candidate_name: 'Nguyễn Văn B',
    candidate_email: 'user@mockai.com',
    candidate_phone: '0987654321',
    portfolio_url: 'https://github.com/nguyenvanb',
    created_at: new Date(),
    updated_at: new Date()
  });

  console.log('Successfully seeded demo application data for User 2 into TechCorp React Developer job!');

  // Reset sequences to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval(pg_get_serial_sequence('cvs', 'id'), COALESCE((SELECT MAX(id) FROM cvs), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('interviews', 'id'), COALESCE((SELECT MAX(id) FROM interviews), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('applications', 'id'), COALESCE((SELECT MAX(id) FROM applications), 1))");
}
