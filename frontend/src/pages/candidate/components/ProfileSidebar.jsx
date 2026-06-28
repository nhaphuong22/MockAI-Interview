import React from "react";
import { Briefcase, GraduationCap, Loader2, Sparkles, Activity } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { applicationApi } from '../../../api/applicationApi';
import { useUiStore } from '../../../store/useUiStore';

export function ProfileSidebar() {
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications-ats'],
    queryFn: async () => {
      const res = await applicationApi.getApplications();
      return res.data || res;
    }
  });

  const appsList = applications || [];
  const evaluatedApps = appsList.filter(app => app.aiFeedback);
  const latestApp = evaluatedApps[0];
  const overallScore = latestApp ? (latestApp.aiScore || latestApp.aiFeedback?.overallScore || 0) : null;

  return (
    <div className="space-y-6">
      {/* AI Score Card */}
      <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 p-6 relative overflow-hidden">
        <h3 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
          Điểm AI ATS Gần Nhất
        </h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
             <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mb-2" />
             <p className="text-sm text-slate-500">Đang phân tích...</p>
          </div>
        ) : overallScore !== null ? (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" className="dark:stroke-slate-800" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#0ea5e9" : "#f59e0b"} />
                    <stop offset="100%" stopColor={overallScore >= 80 ? "#059669" : overallScore >= 60 ? "#38bdf8" : "#d97706"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${overallScore >= 80 ? 'text-emerald-500' : overallScore >= 60 ? 'text-[#0ea5e9]' : 'text-amber-500'}`}>
                    {overallScore}
                  </div>
                  <div className="text-xs dark:text-slate-400 text-gray-600 font-medium">/ 100</div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm dark:text-slate-400 text-slate-600 font-medium">
              {overallScore >= 80 ? "Hồ sơ của bạn có độ phù hợp rất cao." : overallScore >= 60 ? "Hồ sơ khá tốt, cần tối ưu thêm từ khóa." : "Độ tương thích chưa cao, hãy cải thiện CV."}
            </p>
          </>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Chưa có dữ liệu đánh giá AI. Hãy nộp CV để hệ thống phân tích!
            </p>
          </div>
        )}
      </div>

      {/* Activity Stats Card */}
      <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl p-6 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Activity className="w-16 h-16" />
        </div>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          Hoạt Động Ứng Tuyển
        </h3>
        {isLoading ? (
          <div className="flex items-center gap-2 mt-4 mb-2 opacity-80">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className="text-4xl font-extrabold mb-1">{appsList.length}</div>
            <p className="text-sm font-medium opacity-90">Tổng đơn đã nộp</p>
            <div className="mt-5 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="opacity-90">Có đánh giá ATS</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-lg">{evaluatedApps.length} đơn</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 p-6">
        <h3 className="font-semibold dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/interview-practice")}
            className="w-full px-4 py-3 dark:bg-[#1e293b] bg-[#f0f9ff] text-[#0ea5e9] font-semibold rounded-xl hover:bg-[#0ea5e9] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-5 h-5" />
            <span>AI Phỏng Vấn Thử</span>
          </button>
          <button
            type="button"
            onClick={() => {
              showToast({
                message: "Hệ thống AI ATS đang đề xuất lộ trình khóa học phù hợp với CV của bạn!",
                type: "success",
              });
              navigate("/cv-review");
            }}
            className="w-full px-4 py-3 border-2 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 border-gray-200 font-semibold rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Khóa Học Đề Xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
