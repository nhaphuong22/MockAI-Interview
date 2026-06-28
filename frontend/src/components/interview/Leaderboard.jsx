import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboardApi } from "../../api/dailyChallengeApi";
import { useAuthStore } from "../../store/useAuthStore";
import { Flame, Trophy, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Leaderboard() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      try {
        const response = await getLeaderboardApi();
        return response.data || response;
      } catch (err) {
        console.warn("Leaderboard API not yet implemented, using mock rankings.");
        return [
          { rank: 1, userId: 101, name: "Nguyễn Văn A", avatar: "", totalScore: 495, streak: 12 },
          { rank: 2, userId: 102, name: "Trần Thị B", avatar: "", totalScore: 480, streak: 10 },
          { rank: 3, userId: 103, name: "Lê Hoàng C", avatar: "", totalScore: 460, streak: 8 },
          { rank: 4, userId: currentUser?.id || 2, name: currentUser?.full_name || "Bạn (Luyện tập)", avatar: currentUser?.avatar_url || "", totalScore: 350, streak: 5 },
          { rank: 5, userId: 105, name: "Phạm Minh D", avatar: "", totalScore: 320, streak: 4 },
          { rank: 6, userId: 106, name: "Hoàng Đức E", avatar: "", totalScore: 290, streak: 3 }
        ];
      }
    }
  });

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 text-slate-400 border border-slate-400/30">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 border border-amber-700/30">
            🥉
          </div>
        );
      default:
        return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
    }
  };

  const filteredData = leaderboardData?.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Motion variants for stagger row list entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black dark:text-white text-slate-800 tracking-tight flex items-center justify-center gap-2">
          Bảng Xếp Hạng Thử Thách <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto">
          Luyện tập phỏng vấn hàng ngày, tích lũy điểm số cao và duy trì chuỗi Streak của bạn để dẫn đầu!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm ứng viên theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl dark:bg-[#0f172a] bg-white border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-white font-bold text-sm focus:outline-none focus:border-[#0ea5e9] shadow-md shadow-slate-100 dark:shadow-none"
        />
      </div>

      {/* Leaderboard Table Container */}
      <div className="overflow-hidden rounded-3xl dark:bg-[#0f172a]/95 bg-white border border-slate-200/50 dark:border-slate-800/80 shadow-2xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0ea5e9]/10 border-t-[#0ea5e9] rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Đang tải bảng xếp hạng...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 font-semibold text-sm">
            Không thể tải dữ liệu bảng xếp hạng. Vui lòng thử lại sau.
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold text-sm">
            Không tìm thấy kết quả phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="px-6 py-4.5 text-left text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Hạng</th>
                  <th className="px-6 py-4.5 text-left text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Ứng viên</th>
                  <th className="px-6 py-4.5 text-center text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Chuỗi Streak</th>
                  <th className="px-6 py-4.5 text-right text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tổng điểm</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-slate-100 dark:divide-slate-800/50"
              >
                {filteredData.map((row) => {
                  const isSelf = Number(row.userId) === Number(currentUser?.id);
                  return (
                    <motion.tr
                      key={row.userId}
                      variants={rowVariants}
                      className={`transition-colors duration-200 ${
                        isSelf
                          ? "bg-sky-500/5 dark:bg-sky-500/10 border-l-4 border-l-[#0ea5e9] font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="px-6 py-4 flex items-center h-full">
                        {getRankBadge(row.rank)}
                      </td>

                      {/* Candidate Profile Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {row.avatar ? (
                              <img
                                src={row.avatar}
                                alt={row.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-sm uppercase">
                                {row.name.substring(0, 1)}
                              </div>
                            )}
                            {isSelf && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[8px] text-white ring-2 ring-white dark:ring-[#0f172a]">
                                <Sparkles className="w-2.5 h-2.5 fill-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm ${isSelf ? "text-[#0ea5e9] dark:text-[#38bdf8] font-black" : "dark:text-slate-200 text-slate-700 font-bold"}`}>
                                {row.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.25 text-[8px] uppercase tracking-wider font-extrabold bg-sky-500/15 text-[#0ea5e9] rounded-md">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Candidate
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Streak Column */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full dark:bg-orange-500/10 bg-orange-500/5 text-orange-500 text-xs font-black">
                          <Flame className={`w-4 h-4 ${row.streak > 0 ? "fill-orange-500" : ""}`} />
                          <span>{row.streak} ngày</span>
                        </div>
                      </td>

                      {/* Score Column */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black dark:text-white text-slate-800 tracking-tight">
                          {row.totalScore} pts
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
