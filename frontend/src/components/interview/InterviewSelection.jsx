import { useState } from "react";
import { Play, Mic, MessageCircle, BarChart3, History, Sparkles, Trophy } from "lucide-react";
import { DailyStreakWidget } from "./DailyStreakWidget";
import { Leaderboard } from "./Leaderboard";

/**
 * InterviewSelection Component
 * Allows candidates to choose between Text and Voice interview practice,
 * and displays past practice sessions history using a premium Tab control.
 */
export function InterviewSelection({ onStartInterview, previousSessions = [], onViewDetail }) {
  const [activeTab, setActiveTab] = useState("practice"); // tabs: practice, history

  const formatTime = (secs) => {
    if (!secs) return "00:00";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl dark:text-white font-extrabold mb-2 tracking-tight flex items-center gap-2">
              AI Luyện Phỏng Vấn <Sparkles className="w-6 h-6 text-[#0ea5e9] animate-pulse" />
            </h1>
            <p className="dark:text-slate-400 text-gray-600 font-medium">
              Luyện tập phản xạ phỏng vấn với AI thông minh chuyên sâu, nhận phân tích radar và đánh giá chi tiết
            </p>
          </div>

          {/* Premium Tab Control */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0 self-start md:self-auto border border-gray-200/20">
            <button
              onClick={() => setActiveTab("practice")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "practice"
                  ? "bg-white dark:bg-[#0ea5e9] dark:text-white text-gray-900 shadow-md scale-105"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Luyện Tập Mới</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                activeTab === "history"
                  ? "bg-white dark:bg-[#0ea5e9] dark:text-white text-gray-900 shadow-md scale-105"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch Sử Phỏng Vấn</span>
              {previousSessions.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-bounce shadow-lg">
                  {previousSessions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "leaderboard"
                  ? "bg-white dark:bg-[#0ea5e9] dark:text-white text-gray-900 shadow-md scale-105"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Bảng Xếp Hạng</span>
            </button>
          </div>
        </div>

        {/* Tab 1: New Practice Options */}
        {activeTab === "practice" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Daily Challenge Streak Widget */}
            <DailyStreakWidget />

            {/* Voice Practice Option */}
            <div
              onClick={() => onStartInterview("voice")}
              className="dark:bg-[#0f172a] bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-dashed border-sky-200 dark:border-sky-500/20 hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:shadow-sky-500/10 hover:-translate-y-1 transition-all cursor-pointer group text-center flex flex-col items-center justify-center relative overflow-hidden"
            >
              {/* Premium Glow effect */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              
              <div className="w-20 h-20 dark:bg-[#1e293b] bg-[#f0f9ff] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md">
                <Mic className="w-10 h-10 text-[#0ea5e9]" />
              </div>
              <h2 className="text-2xl md:text-3xl dark:text-white font-extrabold mb-4">Luyện Phỏng Vấn Bằng Giọng Nói AI</h2>
              <p className="dark:text-slate-400 text-gray-600 mb-6 leading-relaxed text-sm md:text-base font-medium max-w-lg">
                Thực hành phản xạ phỏng vấn trực tiếp bằng giọng nói qua Microphone với AI Coach. AI tự động bóc tách giọng nói, phân tích độ sâu kỹ thuật, mức độ tự tin, cấu trúc STAR và xây dựng biểu đồ năng lực thời gian thực.
              </p>
              <div className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl font-extrabold hover:shadow-xl hover:shadow-sky-500/15 group-hover:scale-105 active:scale-95 transition-all">
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt Đầu Luyện Tập Giọng Nói</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Practice Sessions History */}
        {activeTab === "history" && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {previousSessions.length > 0 ? (
              <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800/80">
                <h2 className="text-xl dark:text-white font-bold mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0ea5e9]" /> Lịch Sử Luyện Tập
                </h2>
                <div className="space-y-4">
                  {previousSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-gray-100 dark:border-slate-800/80 rounded-2xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:shadow-md hover:shadow-sky-500/5 transition-all bg-slate-50/50 dark:bg-slate-900/10"
                    >
                      <div className="flex items-center gap-4">
                        {/* Score Circular Badge */}
                        <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex flex-col items-center justify-center text-white shadow-md shadow-sky-500/10 shrink-0">
                          <span className="text-lg font-black leading-none">{session.overall_score}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Điểm</span>
                        </div>
                        
                        <div>
                          <div className="font-bold dark:text-white text-base mb-1">{session.position}</div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs dark:text-slate-400 text-gray-500 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              Hình thức: {session.type === "REAL" || session.type === "INTERVIEW" ? "Phỏng vấn thật" : "Luyện tập"}
                            </span>
                            <span>•</span>
                            <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span>{session.qa_details ? session.qa_details.length : 5} câu hỏi</span>
                            <span>•</span>
                            <span>Thời lượng: {formatTime(session.duration_seconds)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewDetail && onViewDetail(session)}
                        className="w-full sm:w-auto px-5 py-3 border-2 dark:border-slate-800 border-gray-200 dark:bg-slate-800/50 bg-white rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] dark:hover:bg-white/5 hover:bg-[#f0f9ff] dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-[#0ea5e9]" />
                        <span>Xem Báo Cáo AI</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Empty State for History
              <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-slate-800/80 space-y-4">
                <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto text-[#0ea5e9] dark:text-[#38bdf8] mb-4">
                  <History className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">Chưa có lịch sử cuộc phỏng vấn</h3>
                <p className="text-sm dark:text-slate-400 text-gray-500 max-w-sm mx-auto leading-relaxed font-medium">
                  Bạn chưa tham gia buổi luyện tập phỏng vấn nào. Hãy nhấn bắt đầu buổi luyện tập đầu tiên của mình ở tab "Luyện Tập Mới" ngay nhé!
                </p>
                <button
                  onClick={() => setActiveTab("practice")}
                  className="px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  Bắt đầu luyện tập
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Global Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <Leaderboard />
          </div>
        )}
      </div>
    </div>
  );
}
