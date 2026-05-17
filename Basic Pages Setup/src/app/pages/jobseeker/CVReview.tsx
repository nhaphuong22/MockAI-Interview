import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Download, Eye } from "lucide-react";
import { useState } from "react";
import * as Progress from "@radix-ui/react-progress";

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

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">AI Chấm Điểm CV</h1>
          <p className="text-gray-600">
            Upload CV của bạn để nhận phân tích chi tiết và gợi ý cải thiện từ AI
          </p>
        </div>

        {!hasCV && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border-2 border-dashed border-gray-300 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#FFF3ED] rounded-2xl flex items-center justify-center">
              <Upload className="w-10 h-10 text-[#E8580C]" />
            </div>
            <h2 className="text-2xl mb-3">Upload CV của bạn</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Hỗ trợ file PDF, DOC, DOCX. Kích thước tối đa 5MB.
              AI sẽ phân tích và đưa ra đánh giá chi tiết.
            </p>
            <button
              onClick={handleUpload}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isAnalyzing ? "Đang phân tích..." : "Chọn File CV"}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Thông tin CV của bạn được bảo mật tuyệt đối
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#FFF3ED] rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-[#E8580C]" />
            </div>
            <h2 className="text-2xl mb-3">AI đang phân tích CV...</h2>
            <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
            <Progress.Root className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
              <Progress.Indicator
                className="h-full bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] transition-all duration-500"
                style={{ width: "60%" }}
              />
            </Progress.Root>
          </div>
        )}

        {showResults && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2">Điểm Tổng Quan</h2>
                  <p className="opacity-90">CV của bạn được đánh giá</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-2">{aiResults.overallScore}</div>
                  <div className="text-xl opacity-90">/100</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span>Điểm Mạnh</span>
                </h3>
                <ul className="space-y-3">
                  {aiResults.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <span>Cần Cải Thiện</span>
                </h3>
                <ul className="space-y-3">
                  {aiResults.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl mb-6">Đánh Giá Chi Tiết Từng Mục</h3>
              <div className="space-y-6">
                {aiResults.sections.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{section.name}</span>
                      <span className="text-[#E8580C] font-semibold">{section.score}%</span>
                    </div>
                    <Progress.Root className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <Progress.Indicator
                        className={`h-full transition-all ${
                          section.score >= 85 ? "bg-green-500" : section.score >= 70 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${section.score}%` }}
                      />
                    </Progress.Root>
                    <p className="text-sm text-gray-600">{section.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span>Tải Báo Cáo PDF</span>
              </button>
              <button className="flex-1 py-3 border-2 border-[#E8580C] text-[#E8580C] rounded-xl hover:bg-[#FFF3ED] transition-all flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                <span>Xem CV Mẫu</span>
              </button>
              <button
                onClick={() => {
                  setHasCV(false);
                  setShowResults(false);
                }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>Upload CV Khác</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
