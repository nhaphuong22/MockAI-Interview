import dotenv from 'dotenv';
dotenv.config();

import { generateQuestionsFromGemini, evaluateCandidateAnswerGemini, generateOverallAssessmentFromGemini } from './src/services/geminiService.js';

async function runTest() {
  console.log("==========================================");
  console.log("🟢 BẮT ĐẦU KIỂM THỬ AI HR PHỎNG VẤN (GEMINI)");
  console.log("==========================================\n");

  // --- BƯỚC 1: GEN CÂU HỎI ---
  console.log("⏳ BƯỚC 1: AI ĐANG TẠO CÂU HỎI TỪ CV...");
  const cvText = "Kinh nghiệm 2 năm làm Frontend Developer với ReactJS, NodeJS. Từng làm việc với Redux, Zustand. Có kỹ năng tối ưu hiệu năng web.";
  const position = "Frontend ReactJS Developer";
  const skills = "ReactJS, Zustand, TailwindCSS, Performance Optimization";
  
  let questions;
  try {
    questions = await generateQuestionsFromGemini({
      position,
      skills,
      experienceLevel: 'JUNIOR',
      cvText
    });
    console.log(`✅ AI đã sinh ra ${questions.length} câu hỏi.`);
    console.log("Mẫu câu hỏi đầu tiên:");
    console.log(`- Câu hỏi: ${questions[0].question_text}`);
    console.log(`- Đáp án kỳ vọng: ${questions[0].expected_answer}`);
  } catch (error) {
    console.error("❌ Lỗi sinh câu hỏi:", error.message);
    return;
  }

  console.log("\n------------------------------------------\n");

  // --- BƯỚC 2: CHẤM ĐIỂM CÂU TRẢ LỜI ---
  console.log("⏳ BƯỚC 2: AI ĐANG CHẤM ĐIỂM CÂU TRẢ LỜI...");
  const questionToTest = questions[0].question_text;
  const expectedAnswer = questions[0].expected_answer;
  // Giả lập câu trả lời của ứng viên (Tương đối tốt nhưng chưa hoàn hảo)
  const candidateAnswer = "Dạ, em thường tối ưu hiệu năng bằng cách dùng React.memo để tránh render lại. Ngoài ra em dùng lazy load cho hình ảnh và tách nhỏ component ra ạ.";

  let evaluation;
  try {
    evaluation = await evaluateCandidateAnswerGemini(questionToTest, expectedAnswer, candidateAnswer);
    console.log("✅ Đánh giá của AI:");
    console.log(`- Điểm số: ${evaluation.score}/10`);
    console.log(`- Nhận xét: ${evaluation.feedback}`);
  } catch (error) {
    console.error("❌ Lỗi chấm điểm:", error.message);
    return;
  }

  console.log("\n------------------------------------------\n");

  // --- BƯỚC 3: TỔNG KẾT PHỎNG VẤN ---
  console.log("⏳ BƯỚC 3: AI ĐANG VIẾT BÁO CÁO TỔNG KẾT...");
  
  // Giả lập danh sách kết quả 3 câu hỏi
  const qaResults = [
    {
      question: "Bạn hiểu thế nào về Virtual DOM?",
      expected_answer: "Virtual DOM là bản sao nhẹ của Real DOM. React dùng nó để so sánh (diffing) và cập nhật Real DOM một cách tối ưu nhất.",
      candidate_answer: "Virtual DOM là cái DOM ảo, giúp React chạy nhanh hơn bình thường.",
      score: 6,
      feedback: "Trả lời được ý cơ bản nhưng thiếu chuyên sâu về diffing algorithm."
    },
    {
      question: "Bạn dùng Zustand khác gì Redux?",
      expected_answer: "Zustand nhẹ hơn, không cần boilerplate, dùng hooks trực tiếp. Redux cồng kềnh hơn nhưng phù hợp hệ thống lớn cần strict flow.",
      candidate_answer: "Zustand em thấy code ít hơn, dễ xài hơn Redux nhiều, không cần setup mệt mỏi.",
      score: 8,
      feedback: "Hiểu được ưu điểm thực tế nhưng trả lời còn hơi cảm tính."
    },
    {
      question: questionToTest,
      expected_answer: expectedAnswer,
      candidate_answer: candidateAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback
    }
  ];

  try {
    const report = await generateOverallAssessmentFromGemini({
      jobTitle: position,
      qaResults: qaResults
    });
    console.log("✅ BÁO CÁO TỔNG QUAN CỦA HR AI:");
    console.log(`- Nhận xét chung: ${report.feedback_summary}`);
    console.log(`- Radar Skills: ${JSON.stringify(report.radar_skills)}`);
    console.log(`- Lộ trình: ${JSON.stringify(report.learning_path)}`);
  } catch (error) {
    console.error("❌ Lỗi viết báo cáo:", error.message);
  }

  console.log("\n==========================================");
  console.log("🎉 KIỂM THỬ HOÀN TẤT!");
}

runTest();
