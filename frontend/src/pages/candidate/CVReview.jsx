import React, { useState } from "react";
import { CVUploadArea } from "./components/CVUploadArea";
import { CVAnalysisLoading } from "./components/CVAnalysisLoading";
import { CVAnalysisResult } from "./components/CVAnalysisResult";

export function CVReview() {
  const [hasCV, setHasCV] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const aiResults = {
    overallScore: 85,
    sections: [
      { name: "Thông tin cá nhân", score: 95, feedback: "Đầy đủ và chuyên nghiệp" },
      { name: "Kinh nghiệm làm việc", score: 90, feedback: "Mô tả chi tiết, có số liệu cụ thể" },
      { name: "Kỹ năng", score: 80, feedback: "Nên bổ sung thêm kỹ năng mềm" },
      { name: "Học vấn", score: 85, feedback: "Tốt, có thể thêm các khóa học online" },
      { name: "Định dạng", score: 75, feedback: "Cần tối ưu ATS, sử dụng font chuẩn" },
    ],
    strengths: [
      "Kinh nghiệm làm việc phong phú với 5 năm trong lĩnh vực Frontend",
      "Có các dự án cụ thể với metrics đo lường được",
      "Kỹ năng kỹ thuật đa dạng và phù hợp với thị trường",
    ],
    improvements: [
      "Thêm summary statement ở đầu CV để thu hút recruiter",
      "Bổ sung thêm kỹ năng mềm (teamwork, leadership)",
      "Tối ưu keywords cho ATS (thêm technical terms phổ biến)",
      "Cân nhắc giảm độ dài xuống 1-2 trang",
    ],
  };

  const handleUpload = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasCV(true);
      setShowResults(true);
    }, 3000);
  };

  const handleReupload = () => {
    setHasCV(false);
    setShowResults(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">AI Chấm Điểm CV</h1>
          <p className="text-gray-600">
            Upload CV của bạn để nhận phân tích chi tiết và gợi ý cải thiện từ AI
          </p>
        </div>

        {!hasCV && !isAnalyzing && (
          <CVUploadArea onUpload={handleUpload} isAnalyzing={isAnalyzing} />
        )}

        {isAnalyzing && (
          <CVAnalysisLoading />
        )}

        {showResults && !isAnalyzing && (
          <CVAnalysisResult aiResults={aiResults} onReupload={handleReupload} />
        )}
      </div>
    </div>
  );
}
export default CVReview;
