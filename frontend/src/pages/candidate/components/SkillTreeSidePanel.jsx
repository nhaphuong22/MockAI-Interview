import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getSkillNodeDetailsApi } from "../../../api/skillTreeApi";

export default function SkillTreeSidePanel({ nodeId, nodeLabel, status, score, onClose }) {
  const navigate = useNavigate();

  // Fetch node details via TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["nodeDetails", nodeId],
    queryFn: async () => {
      const res = await getSkillNodeDetailsApi(nodeId, nodeLabel);
      return res.data;
    },
    enabled: !!nodeId
  });

  const handleStartPractice = () => {
    // Navigate to InterviewPractice and pass the skill label to auto-start, along with its specific questions
    navigate("/interview-practice", { 
      state: { 
        autoStartSkill: nodeLabel,
        skillQuestions: data?.practice_questions || []
      } 
    });
  };

  const isUnlocked = status === "unlocked";

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
      />

      {/* Slide-in Sidebar Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md dark:bg-[#0f172a] bg-white shadow-2xl z-50 border-l dark:border-white/5 border-slate-200 flex flex-col"
      >
        {/* Panel Header */}
        <div className="p-6 border-b dark:border-white/5 border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full dark:bg-sky-500/10 dark:text-[#0ea5e9] bg-sky-50 text-sky-600">
              Kỹ Năng
            </span>
            <h3 className="text-2xl font-bold dark:text-white text-gray-800 mt-1">
              {nodeLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-slate-200 text-gray-500 dark:text-slate-400 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Panel Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Score Badges */}
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 rounded-xl border dark:border-white/5 border-slate-100 dark:bg-slate-800/30 bg-slate-50 text-center">
              <span className="block text-[10px] uppercase font-bold dark:text-slate-400 text-gray-500">
                Trạng thái
              </span>
              <span className={`text-sm font-bold block mt-1 ${isUnlocked ? "text-emerald-500" : "text-gray-500"}`}>
                {isUnlocked ? "🟢 Đã mở khoá" : "🔒 Chưa mở khoá"}
              </span>
            </div>
            
            <div className="flex-1 p-3 rounded-xl border dark:border-white/5 border-slate-100 dark:bg-slate-800/30 bg-slate-50 text-center">
              <span className="block text-[10px] uppercase font-bold dark:text-slate-400 text-gray-500">
                Điểm số RPG
              </span>
              <span className="text-lg font-black block text-[#0ea5e9]">
                {isUnlocked ? `${score}/100` : "—"}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0ea5e9]"></div>
              <p className="mt-3 text-xs dark:text-slate-400 text-gray-500">Đang tải tài liệu học tập...</p>
            </div>
          ) : error || !data ? (
            <div className="text-center py-12 dark:text-slate-400 text-gray-500 text-sm">
              Không thể tải dữ liệu học tập chi tiết của kỹ năng này.
            </div>
          ) : (
            <>
              {/* AI Feedback */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider dark:text-slate-400 text-gray-500 flex items-center gap-1.5">
                  <span>💡</span> Nhận xét & Khuyên học (AI Feedback)
                </h4>
                <div className="p-4 rounded-xl dark:bg-[#0b1329] bg-sky-50/50 border dark:border-sky-500/10 border-sky-100 text-sm dark:text-slate-300 text-slate-700 leading-relaxed shadow-sm">
                  {data.ai_feedback}
                </div>
              </div>

              {/* Practice Questions */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider dark:text-slate-400 text-gray-500 flex items-center gap-1.5">
                  <span>⚔️</span> Phỏng Vấn Thử (Practice Questions)
                </h4>
                <div className="space-y-2.5">
                  {data.practice_questions?.slice(0, 3).map((q, idx) => (
                    <div
                      key={`question-${idx}`}
                      onClick={handleStartPractice}
                      className="p-3.5 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-slate-800/40 bg-white hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/5 hover:bg-sky-50/20 cursor-pointer transition-all duration-300 shadow-xs flex flex-col gap-1.5 group"
                    >
                      <div className="flex gap-2">
                        <span className="text-[#0ea5e9] font-bold text-sm">Q{idx + 1}.</span>
                        <p className="text-sm font-semibold dark:text-slate-200 text-gray-700 group-hover:text-[#0ea5e9] transition-colors leading-snug">
                          {q.question}
                        </p>
                      </div>
                      <p className="text-[11px] dark:text-slate-400 text-gray-500 pl-7 leading-relaxed">
                        Gợi ý: <span className="italic">{q.expected_answer}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Courses */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider dark:text-slate-400 text-gray-500 flex items-center gap-1.5">
                  <span>📚</span> Tài liệu ôn tập & Khóa học
                </h4>
                <div className="space-y-2">
                  {data.courses?.map((course, idx) => (
                    <a
                      key={`course-${idx}`}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border dark:border-white/5 border-slate-100 dark:bg-slate-800/20 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs font-semibold dark:text-slate-300 text-gray-700 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-all cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <span>📖</span> {course.title}
                      </span>
                      <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">
                        ➔
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Panel Footer - CTA */}
        <div className="p-6 border-t dark:border-white/5 border-slate-100">
          <button
            onClick={handleStartPractice}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold text-sm shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚔️</span> Luyện Tập Phỏng Vấn Kỹ Năng
          </button>
        </div>
      </motion.div>
    </>
  );
}
