/**
 * Seed: Daily Questions, Daily Streaks, and Leaderboard Scores
 * Populate daily questions and ranking data for candidates based on realistic daily streak rules:
 * - Each day candidate answers 1 question (max 100 pts per question).
 * - Total score = sum of scores accumulated across streak days.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear existing challenge data
  await knex('leaderboard_scores').del();
  await knex('daily_streaks').del();
  await knex('daily_questions').del();

  const now = new Date();
  const getPastDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  // 1. Create 15 daily questions for 15 days of practice
  const questionTemplates = [
    { track: 'frontend', q: 'Hãy giải thích sự khác biệt giữa Virtual DOM và Real DOM trong React?', a: 'Virtual DOM giúp React so sánh và chỉ re-render những element thực sự thay đổi.' },
    { track: 'backend', q: 'Cơ chế hoạt động của JWT (JSON Web Token) trong xác thực API là gì?', a: 'JWT gồm 3 phần: Header, Payload, Signature giúp xác thực người dùng không cần lưu session server.' },
    { track: 'general', q: 'Hãy tự giới thiệu bản thân và định hướng nghề nghiệp trong 2 năm tới?', a: 'Em tên là..., định hướng trở thành Fullstack Developer chuyên sâu.' },
    { track: 'frontend', q: 'State management với Zustand khác gì so với Redux Toolkit?', a: 'Zustand nhẹ hơn, không dùng boilerplate code phức tạp và kết nối trực tiếp component.' },
    { track: 'backend', q: 'Database Indexing giúp tăng tốc truy vấn SQL như thế nào?', a: 'Index tạo cấu trúc B-Tree giúp tìm kiếm O(log N) thay vì full table scan O(N).' },
    { track: 'general', q: 'Điểm yếu lớn nhất của bạn là gì và bạn khắc phục nó ra sao?', a: 'Em đôi khi quá cẩn thận với chi tiết, em quản lý thời gian bằng checklist.' },
    { track: 'frontend', q: 'Giải thích khái niệm Closure trong JavaScript?', a: 'Closure là một hàm có khả năng ghi nhớ scope nơi nó được định nghĩa ngay cả khi đã thực thi xong.' },
    { track: 'backend', q: 'Khác biệt giữa SQL và NoSQL database là gì?', a: 'SQL quản lý dữ liệu có cấu trúc bảng mối quan hệ, NoSQL linh hoạt tài liệu JSON hoặc Key-Value.' },
    { track: 'general', q: 'Tại sao bạn lại muốn ứng tuyển vào vị trí này?', a: 'Em nhận thấy giá trị và sản phẩm công ty rất phù hợp với định hướng nghề nghiệp của em.' },
    { track: 'frontend', q: 'Custom Hook trong React được tạo ra nhằm mục đích gì?', a: 'Custom Hook giúp tái sử dụng stateful logic giữa các component một cách độc lập.' },
    { track: 'backend', q: 'RESTful API khác gì so với GraphQL?', a: 'REST dùng các endpoint cố định, GraphQL cho phép client truy vấn chính xác trường dữ liệu cần.' },
    { track: 'general', q: 'Hãy kể về một lần bạn làm việc nhóm bị bất đồng ý kiến?', a: 'Em lăng nghe lập luận các bên và dùng data/kiểm thử thực tế để thống nhất.' },
    { track: 'frontend', q: 'Kỹ thuật Lazy Loading và Code Splitting trong React giúp gì?', a: 'Giúp giảm bundle size ban đầu và chỉ load code component khi thực sự cần dùng.' },
    { track: 'backend', q: 'Cơ chế Connection Pooling trong PostgreSQL hoạt động thế nào?', a: 'Duy trì sẵn các kết nối mở tới DB để tái sử dụng thay vì khởi tạo kết nối mới liên tục.' },
    { track: 'general', q: 'Bạn xử lý công việc như thế nào khi deadline rất gấp?', a: 'Em phân loại ưu tiên công việc quan trọng (MoSCoW) và trao đổi với team để đạt mục tiêu.' }
  ];

  const questionRecords = [];
  for (let i = 0; i < questionTemplates.length; i++) {
    questionRecords.push({
      track: questionTemplates[i].track,
      question_text: questionTemplates[i].q,
      sample_answer: questionTemplates[i].a,
      created_at: getPastDate(14 - i),
      updated_at: getPastDate(14 - i)
    });
  }

  const insertedQuestions = await knex('daily_questions').insert(questionRecords).returning('id');
  const questionIds = insertedQuestions.map(item => (typeof item === 'object' ? item.id : item));

  // 2. Candidates leaderboard profiles with realistic accumulated scores:
  // Streak N = Candidate has answered K questions (1 question per day, max 100 points/day).
  const candidateStreaks = [
    { user_id: 8, streak: 14, baseScore: 90 },  // 14 câu ~ 1,260 pts (Trần Thị Mai)
    { user_id: 9, streak: 12, baseScore: 88 },  // 12 câu ~ 1,056 pts (Lê Quốc Bảo)
    { user_id: 10, streak: 11, baseScore: 87 }, // 11 câu ~ 957 pts (Phạm Nhật Minh)
    { user_id: 2, streak: 10, baseScore: 86 },  // 10 câu ~ 860 pts (Nguyễn Hoàng Nam - Current User)
    { user_id: 11, streak: 9, baseScore: 85 },  // 9 câu ~ 765 pts (Hoàng Đức Thắng)
    { user_id: 12, streak: 8, baseScore: 84 },  // 8 câu ~ 672 pts (Vũ Thị Ngọc Anh)
    { user_id: 13, streak: 7, baseScore: 83 },  // 7 câu ~ 581 pts (Đặng Văn Khoa)
    { user_id: 14, streak: 6, baseScore: 82 },  // 6 câu ~ 492 pts (Ngô Thị Phương Thảo)
    { user_id: 15, streak: 5, baseScore: 81 },  // 5 câu ~ 405 pts (Bùi Anh Tuấn)
    { user_id: 16, streak: 5, baseScore: 78 },  // 5 câu ~ 390 pts (Đỗ Thanh Tùng)
    { user_id: 17, streak: 4, baseScore: 80 },  // 4 câu ~ 320 pts (Phan Hoàng Yến)
    { user_id: 18, streak: 4, baseScore: 77 },  // 4 câu ~ 308 pts (Dương Minh Triết)
    { user_id: 19, streak: 3, baseScore: 82 },  // 3 câu ~ 246 pts (Lý Gia Huy)
    { user_id: 20, streak: 3, baseScore: 76 },  // 3 câu ~ 228 pts (Trịnh Hồng Nhung)
    { user_id: 21, streak: 2, baseScore: 80 },  // 2 câu ~ 160 pts (Võ Thành Đạt)
    { user_id: 22, streak: 1, baseScore: 85 }   // 1 câu = 85 pts (Nguyễn Khánh Hà - 1 ngày streak)
  ];

  const streaksToInsert = [];
  const scoresToInsert = [];

  for (const cand of candidateStreaks) {
    streaksToInsert.push({
      user_id: cand.user_id,
      streak_count: cand.streak,
      last_answered_at: now,
      created_at: now,
      updated_at: now
    });

    // Insert 1 question submission per streak day
    for (let day = 0; day < cand.streak; day++) {
      const qId = questionIds[day % questionIds.length];
      // Slight variation in daily score (e.g. baseScore +/- 3 pts, max 100)
      const dailyScore = Math.min(100, Math.max(50, cand.baseScore + (day % 3) - 1));
      
      scoresToInsert.push({
        user_id: cand.user_id,
        question_id: qId,
        score: dailyScore,
        answered_at: getPastDate(cand.streak - 1 - day)
      });
    }
  }

  await knex('daily_streaks').insert(streaksToInsert);
  await knex('leaderboard_scores').insert(scoresToInsert);

  console.log(`[Seed] Đã khởi tạo chuẩn xác dữ liệu Daily Questions và Ranking chuẩn quy tắc (1 câu/ngày, tối đa 100 điểm) cho ${candidateStreaks.length} ứng viên.`);
}
