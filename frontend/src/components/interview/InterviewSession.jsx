import { Sparkles, Clock, Mic } from "lucide-react";

/**
 * InterviewSession Component
 * Manages active interview UI - either text entry or voice recording.
 */
export function InterviewSession({ 
  interviewType, 
  currentQuestion, 
  questions, 
  onNext, 
  onCancel 
}) {
  const isTextMode = interviewType === "text";
  const questionText = questions[currentQuestion] || "";

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      {/* Header bar */}
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
          <div className="text-white">Câu {currentQuestion + 1}/{questions.length}</div>
          <div className="h-8 w-px bg-gray-600" />
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Kết Thúc
          </button>
        </div>
      </div>

      {/* Main question area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl p-8 mb-6 text-center shadow-lg">
            <div className="text-sm text-[#0ea5e9] mb-2">Câu Hỏi {currentQuestion + 1}</div>
            <h2 className="text-3xl mb-4 font-semibold text-gray-800">{questionText}</h2>
            <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Câu hỏi hành vi
            </div>
          </div>

          {isTextMode ? (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <textarea
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none text-gray-700"
                rows={6}
                autoFocus
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  <span className="text-[#0ea5e9] font-semibold">Gợi ý:</span> Sử dụng phương pháp STAR
                  (Situation, Task, Action, Result)
                </div>
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {currentQuestion < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-xl mb-6 text-gray-800">Đang ghi âm...</p>
              <button 
                onClick={onNext}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                {currentQuestion < questions.length - 1 ? "Dừng Ghi Âm & Tiếp Tục" : "Dừng Ghi Âm & Hoàn Thành"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress tracker footbar */}
      <div className="bg-gray-800 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-350 ${
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
