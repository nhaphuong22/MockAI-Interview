import { Play, Mic, Video, Sparkles, MessageCircle, BarChart3, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { createVoiceSessionApi } from "../../api/voiceSession";

const mockQuestions = [
  "Hãy giới thiệu về bản thân bạn",
  "Tại sao bạn muốn làm việc ở vị trí này?",
  "Điểm mạnh và điểm yếu của bạn là gì?",
  "Kể về một dự án bạn tự hào nhất",
  "Bạn xử lý xung đột trong team như thế nào?",
];

const previousSessions = [
  {
    id: 1,
    date: "2026-05-10",
    position: "Senior Frontend Developer",
    score: 88,
    questions: 10,
    duration: "15 phút",
  },
  {
    id: 2,
    date: "2026-05-08",
    position: "Full Stack Developer",
    score: 82,
    questions: 10,
    duration: "14 phút",
  },
];

export function InterviewPractice() {
  const [mode, setMode] = useState("select");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewType, setInterviewType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startInterview = (type) => {
    setInterviewType(type);
    if (type === "voice") {
      setMode("setup");
    } else {
      setMode("practicing");
    }
  };

  const handleProceedVoice = async () => {
    setIsSubmitting(true);
    try {
      // Register voice session with sample interview_id 1
      const response = await createVoiceSessionApi(1);
      console.log("Voice session registered successfully:", response.data);
      setMode("practicing");
    } catch (error) {
      console.error("Error registering voice session:", error);
      // Fallback so candidate can still practice even if API fails
      setMode("practicing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "setup") {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center">
        <MicrophoneSetup 
          onProceed={handleProceedVoice} 
          isSubmitting={isSubmitting} 
        />
      </div>
    );
  }

  if (mode === "practicing") {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0ea5e9] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">AI Interview Coach</div>
              <div className="text-sm text-gray-400">Đang phỏng vấn</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5" />
              <span>12:45</span>
            </div>
            <div className="text-white">Câu {currentQuestion + 1}/10</div>
            <div className="h-8 w-px bg-gray-600" />
            <button
              onClick={() => setMode("feedback")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Kết Thúc
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="bg-white rounded-2xl p-8 mb-6 text-center">
              <div className="text-sm text-[#0ea5e9] mb-2">Câu Hỏi {currentQuestion + 1}</div>
              <h2 className="text-3xl mb-4">{mockQuestions[currentQuestion]}</h2>
              <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Câu hỏi hành vi
              </div>
            </div>

            {interviewType === "text" ? (
              <div className="bg-white rounded-2xl p-6">
                <textarea
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none"
                  rows={6}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    <span className="text-[#0ea5e9] font-semibold">Gợi ý:</span> Sử dụng phương pháp STAR
                    (Situation, Task, Action, Result)
                  </div>
                  <button
                    onClick={() => {
                      if (currentQuestion < mockQuestions.length - 1) {
                        setCurrentQuestion(currentQuestion + 1);
                      } else {
                        setMode("feedback");
                      }
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    {currentQuestion < mockQuestions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-12 h-12 text-red-600" />
                </div>
                <p className="text-xl mb-6">Đang ghi âm...</p>
                <button className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                  Dừng Ghi Âm
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              {mockQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index < currentQuestion
                      ? "bg-green-500"
                      : index === currentQuestion
                      ? "bg-[#0ea5e9]"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "feedback") {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl mb-2">Hoàn Thành Phỏng Vấn!</h1>
            <p className="text-gray-600">Đây là phản hồi chi tiết từ AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-2 text-[#0ea5e9]">85</div>
              <div className="text-gray-600">Điểm Tổng</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-2">10/10</div>
              <div className="text-gray-600">Câu Trả Lời</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-2">15:23</div>
              <div className="text-gray-600">Thời Gian</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl mb-6">Phản Hồi Chi Tiết</h2>
            <div className="space-y-6">
              {mockQuestions.slice(0, 3).map((question, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Câu {index + 1}: {question}</div>
                      <div className="text-sm text-gray-600">Câu trả lời của bạn đã được phân tích</div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {85 + index * 2}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      ✅ Câu trả lời có cấu trúc tốt và đi thẳng vào vấn đề. Bạn đã sử dụng ví dụ cụ thể.
                      <br />
                      💡 Có thể cải thiệnêm metrics định lượng để câu trả lời thuyết phục hơn.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode("select");
                setCurrentQuestion(0);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all"
            >
              Luyện Lại
            </button>
            <button className="flex-1 py-3 border-2 border-[#0ea5e9] text-[#0ea5e9] rounded-xl hover:bg-[#f0f9ff] transition-all">
              Tải Báo Cáo
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div
            onClick={() => startInterview("text")}
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

          <div
            onClick={() => startInterview("voice")}
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
