import { Sparkles, ArrowRight, Award, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function AiTeaserSidebar({
  recommendedJobs = [],
  onSelectJob
}) {
  const navigate = useNavigate();

  // Lấy 3 job có điểm phù hợp AI cao nhất để hiển thị
  const displayRecommendations = [...recommendedJobs]
    .sort((a, b) => b.aiMatch - a.aiMatch)
    .slice(0, 3);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* 1. AI 3D Interview Practice Teaser Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-slate-950 border border-white/5 shadow-xl group text-white cursor-pointer"
        onClick={() => navigate("/interview-practice")}
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/20 rounded-full blur-[40px] group-hover:bg-[#0ea5e9]/30 transition-colors" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#38bdf8]/10 rounded-full blur-[30px]" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex p-2 bg-[#0ea5e9]/10 rounded-xl border border-sky-500/20 text-[#0ea5e9]">
            <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-sky-400">AI 3D Interview Prep</span>
            <h3 className="text-base font-extrabold leading-tight mt-1">Luyện phỏng vấn 3D tương tác với AI</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
              Trò chuyện thoại thời gian thực với Avatar AI ảo 3D sinh động, nhận nhận xét điểm mạnh điểm yếu và điểm số chi tiết.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[#0ea5e9] text-xs font-bold group-hover:gap-2 transition-all">
            <span>Trải nghiệm phòng ảo 3D</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* 2. AI CV Review Teaser Card */}
      <div className="p-5 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-500/20 mb-3 text-emerald-500">
          📄
        </div>
        <h4 className="text-sm font-bold dark:text-white text-gray-900 mb-1">Tối Ưu CV Bằng AI</h4>
        <p className="text-[11px] text-gray-500 dark:text-slate-400 px-2 leading-relaxed font-medium">
          Tải lên CV để AI phân tích mức độ phù hợp với công việc và đề xuất bộ từ khóa chuẩn ATS giúp vượt qua vòng lọc.
        </p>
        <Link 
          to="/cv-review"
          className="mt-4 w-full py-2 border border-sky-100 dark:border-sky-950 text-xs font-bold text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-50 to-white dark:from-slate-900/60 dark:to-slate-800/60 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phân tích CV ngay</span>
        </Link>
      </div>

      {/* 3. Recommended Jobs based on AI Score */}
      {displayRecommendations.length > 0 && (
        <div className="p-5 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider dark:text-white text-gray-900">Gợi ý việc làm phù hợp</h4>
          </div>

          <div className="space-y-3.5">
            {displayRecommendations.map((job) => (
              <div 
                key={job.id}
                onClick={() => onSelectJob && onSelectJob(job.id)}
                className="group p-3 rounded-xl border border-gray-50 dark:border-white/5 hover:border-[#0ea5e9]/20 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-gray-800 dark:text-slate-200 group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                    {job.title}
                  </h5>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">{job.company}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-white/5 text-[10px] font-bold text-[#0ea5e9]">
                  <div className="flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    <span>{job.salary}</span>
                  </div>
                  <span className="text-gray-400 dark:text-slate-500 font-semibold">{job.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
