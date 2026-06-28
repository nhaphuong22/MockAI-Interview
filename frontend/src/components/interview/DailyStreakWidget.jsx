import { useState } from "react";
import { Flame, Trophy, Zap, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDailyStreakApi } from "../../api/dailyChallengeApi";
import { DailyChallengeModal } from "./DailyChallengeModal";

export function DailyStreakWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch streak status using React Query with fallback
  const { data: streakData, isLoading, refetch } = useQuery({
    queryKey: ["dailyStreak"],
    queryFn: async () => {
      try {
        const response = await getDailyStreakApi();
        return response.data || response;
      } catch (err) {
        console.warn("Daily streak API not yet implemented, using mock values.");
        return {
          streak_count: 5,
          last_answered_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          has_answered_today: false,
          rank: 12
        };
      }
    }
  });

  const hasAnsweredToday = streakData?.has_answered_today === true;
  const streakCount = streakData?.streak_count || 0;
  const rank = streakData?.rank || "10+";

  return (
    <div className="relative overflow-hidden rounded-3xl dark:bg-[#0f172a]/90 bg-white border border-slate-200/50 dark:border-slate-800/80 shadow-2xl p-6 transition-all duration-300 hover:shadow-sky-500/5">
      {/* Background Glows */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Section: Streak and Status */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 shadow-inner shrink-0 animate-pulse">
            <Flame className={`w-8 h-8 ${streakCount > 0 ? "fill-orange-500" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black dark:text-white text-slate-800 tracking-tight">
                {streakCount} Ngày Liên Tục!
              </span>
              {hasAnsweredToday && (
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 rounded-full border border-green-500/20 animate-bounce">
                  Đã làm
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm max-w-md">
              {hasAnsweredToday
                ? "Tuyệt vời! Bạn đã duy trì chuỗi phỏng vấn hôm nay. Hẹn gặp lại vào ngày mai!"
                : "Thử thách phỏng vấn nhanh 60 giây hôm nay đã sẵn sàng. Trả lời ngay để duy trì streak!"}
            </p>
          </div>
        </div>

        {/* Right Section: Stats and Actions */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Rank Badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-[10px] font-extrabold uppercase text-slate-400 leading-none">
                Bảng xếp hạng
              </div>
              <div className="text-sm font-black dark:text-white text-slate-800">
                Top #{rank}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {hasAnsweredToday ? (
            <button
              disabled
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-extrabold text-sm border border-slate-200/10 cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              <span>Đã Hoàn Thành Hôm Nay</span>
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              <Zap className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
              <span>Bắt Đầu Thử Thách</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Daily Challenge */}
      {isModalOpen && (
        <DailyChallengeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            refetch(); // Refetch daily status after successful submission
          }}
        />
      )}
    </div>
  );
}
