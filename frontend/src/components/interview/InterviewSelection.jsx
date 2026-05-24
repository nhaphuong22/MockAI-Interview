import { Play, Mic, MessageCircle, BarChart3 } from "lucide-react";

/**
 * InterviewSelection Component
 * Allows candidates to choose between Text and Voice interview practice,
 * and displays past practice sessions history.
 */
export function InterviewSelection({ onStartInterview, previousSessions }) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">AI Luyện Phỏng Vấn</h1>
          <p className="text-gray-600">
            Luyện tập kỹ năng phỏng vấn với AI thông minh, nhận phản hồi chi tiết
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Text Practice Option */}
          <div
            onClick={() => onStartInterview("text")}
            className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:border-[#0ea5e9] hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#f0f9ff] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <h2 className="text-2xl mb-3">Phỏng Vấn Văn Bản</h2>
            <p className="text-gray-600 mb-4">
              Trả lời các câu hỏi phỏng vấn bằng văn bản. Phù hợp để luyện tập cấu trúc câu trả lời.
            </p>
            <div className="flex items-center gap-2 text-[#0ea5e9]">
              <Play className="w-5 h-5" />
              <span className="font-semibold">Bắt Đầu Ngay</span>
            </div>
          </div>

          {/* Voice Practice Option */}
          <div
            onClick={() => onStartInterview("voice")}
            className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:border-[#0ea5e9] hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#f0f9ff] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <h2 className="text-2xl mb-3">Phỏng Vấn Giọng Nói</h2>
            <p className="text-gray-600 mb-4">
              Thực hành phỏng vấn bằng giọng nói, AI phân tích cả nội dung và cách trình bày.
            </p>
            <div className="flex items-center gap-2 text-[#0ea5e9]">
              <Play className="w-5 h-5" />
              <span className="font-semibold">Bắt Đầu Ngay</span>
            </div>
          </div>
        </div>

        {/* Practice Sessions History */}
        {previousSessions.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl mb-6">Lịch Sử Luyện Tập</h2>
            <div className="space-y-4">
              {previousSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-6 p-4 border border-gray-200 rounded-xl hover:border-[#0ea5e9] transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-white font-semibold">
                    {session.score}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{session.position}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                      <span>{session.questions} câu hỏi</span>
                      <span>{session.duration}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Xem Chi Tiết</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
