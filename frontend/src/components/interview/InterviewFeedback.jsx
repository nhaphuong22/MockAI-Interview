import { CheckCircle2 } from "lucide-react";

/**
 * InterviewFeedback Component
 * Displays evaluation metrics and detailed question-by-question AI feedback
 * after the interview session concludes.
 */
export function InterviewFeedback({ questions, onRetry }) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Hoàn Thành Phỏng Vấn!</h1>
          <p className="text-gray-600">Đây là phản hồi chi tiết từ AI</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-4xl font-bold mb-2 text-[#0ea5e9]">85</div>
            <div className="text-gray-500 font-medium">Điểm Tổng</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-4xl font-bold mb-2 text-gray-800">10/10</div>
            <div className="text-gray-500 font-medium">Câu Trả Lời</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-4xl font-bold mb-2 text-gray-800">15:23</div>
            <div className="text-gray-500 font-medium">Thời Gian</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Phản Hồi Chi Tiết</h2>
          <div className="space-y-6">
            {questions.slice(0, 3).map((question, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Câu {index + 1}: {question}</div>
                    <div className="text-sm text-gray-500">Câu trả lời của bạn đã được phân tích</div>
                  </div>
                  <div className="px-3 py-1 bg-green-150 text-green-700 rounded-full text-sm font-semibold shrink-0">
                    {85 + index * 2}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-emerald-600">✅ Ưu điểm:</span> Câu trả lời có cấu trúc tốt và đi thẳng vào vấn đề. Bạn đã sử dụng ví dụ cụ thể.
                    <br />
                    <span className="font-semibold text-amber-600">💡 Góp ý:</span> Có thể cải thiện thêm các số liệu định lượng (metrics) để câu trả lời thêm phần thuyết phục.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.01]"
          >
            Luyện Lại
          </button>
          <button className="flex-1 py-3 border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold rounded-xl hover:bg-[#f0f9ff] transition-all hover:scale-[1.01]">
            Tải Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
}
