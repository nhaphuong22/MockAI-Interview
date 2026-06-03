export const getDefaultLearningPath = (candidateName, positionName, skills) => [
  {
    phase: 'Chặng 1: Củng cố Kiến thức & Cấu trúc (Ngày 1 - 3)',
    topic: 'Cấu trúc câu trả lời STAR',
    action: 'Luyện tập trả lời bằng cách chia rõ Bối cảnh, Nhiệm vụ, Hành động và Kết quả.'
  },
  {
    phase: 'Chặng 2: Nâng cao Chuyên môn thực tế (Ngày 4 - 7)',
    topic: `Tập trung chuyên môn liên quan đến ${skills || 'công nghệ'}`,
    action: `Đi sâu nghiên cứu các giải pháp tối ưu liên quan trực tiếp đến vị trí ${positionName}.`
  },
  {
    phase: 'Chặng 3: Làm chủ tâm lý & Giọng điệu (Ngày 8 - 10)',
    topic: 'Luyện tập hội thoại tự tin',
    action: 'Luyện tập nói trôi chảy, có điểm nhấn và chuẩn bị tâm lý tự tin.'
  }
];

export const getDefaultRadarSkills = (overallScore) => ({
  technical_depth: Math.max(0, Math.min(overallScore + 2, 95)),
  communication: Math.max(0, Math.min(overallScore + 5, 95)),
  problem_solving: Math.max(0, Math.min(overallScore + 1, 95)),
  confidence: Math.max(0, Math.min(overallScore + 3, 95)),
  star_structure: Math.max(0, Math.min(overallScore - 2, 95))
});
