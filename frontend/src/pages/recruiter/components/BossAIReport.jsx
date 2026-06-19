import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { Sparkles, Users, UserCheck, UserX, Target, Loader2, ShieldAlert } from "lucide-react";

export function BossAIReport({ jobId }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["boss-ai-report", jobId],
    queryFn: async () => {
      const response = await jobApi.getJobCampaignReport(jobId);
      return response.data;
    },
    enabled: false, // Không tự động chạy, HR phải bấm nút
    retry: false
  });

  if (!data && !isLoading && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-sky-50/50 -z-10" />
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-6 transform rotate-3">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Phân Tích Chiến Dịch Tuyển Dụng</h3>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Boss AI (Gemini) sẽ đọc toàn bộ dữ liệu ứng viên đã hoàn thành phỏng vấn và sinh báo cáo tổng hợp chuyên sâu để bạn đưa ra quyết định cuối cùng.
        </p>
        <button
          onClick={() => refetch()}
          className="group relative px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl overflow-hidden hover:scale-[1.02] transition-all shadow-xl shadow-gray-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> 
            Khởi động Boss AI Phân Tích
          </span>
        </button>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/30 to-purple-50/30 animate-pulse -z-10" />
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sếp Gemini đang phân tích dữ liệu...</h3>
        <p className="text-gray-500 text-sm">Quá trình này có thể mất từ 5 - 15 giây tùy vào số lượng ứng viên.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-rose-600 font-bold mb-2 text-lg">Không thể sinh báo cáo!</p>
        <p className="text-gray-500 mb-6 max-w-md text-sm">{error?.response?.data?.message || "Lỗi hệ thống khi gọi Boss AI."}</p>
        <button onClick={() => refetch()} className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold transition-colors">
          Thử lại
        </button>
      </div>
    );
  }

  const report = data?.data; // axios returns { message, data: { ... } }
  const stats = report?.statistics;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-sm font-bold text-gray-500">Tổng Ứng Viên</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.total_candidates}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-gray-500">Đạt Yêu Cầu</p>
            </div>
            <p className="text-3xl font-black text-emerald-600">{stats.qualified}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <UserX className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-gray-500">Bị Loại</p>
            </div>
            <p className="text-3xl font-black text-rose-600">{stats.rejected}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-sm font-bold text-gray-500">Điểm Trung Bình</p>
            </div>
            <p className="text-3xl font-black text-indigo-600">{stats.average_score}</p>
          </div>
        </div>
      )}

      {/* 2. Campaign Summary */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Đánh Giá Tổng Quan</h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              {report?.campaign_summary}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Action Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interview Now */}
        <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden flex flex-col shadow-sm">
          <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex items-center justify-between">
            <h4 className="font-black text-emerald-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nhóm Gọi Phỏng Vấn
            </h4>
            <span className="text-emerald-600 font-bold text-sm">{report?.action_categories?.interview_now?.length || 0}</span>
          </div>
          <div className="p-5 flex-1 bg-gradient-to-b from-white to-emerald-50/30">
            {report?.action_categories?.interview_now?.length > 0 ? (
              <div className="space-y-4">
                {report.action_categories.interview_now.map((c, i) => (
                  <div key={i} className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 py-10 font-medium">Không có ứng viên nào.</p>
            )}
          </div>
        </div>

        {/* Keep in pool */}
        <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden flex flex-col shadow-sm">
          <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-center justify-between">
            <h4 className="font-black text-amber-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Nhóm Dự Phòng
            </h4>
            <span className="text-amber-600 font-bold text-sm">{report?.action_categories?.keep_in_pool?.length || 0}</span>
          </div>
          <div className="p-5 flex-1 bg-gradient-to-b from-white to-amber-50/30">
            {report?.action_categories?.keep_in_pool?.length > 0 ? (
              <div className="space-y-4">
                {report.action_categories.keep_in_pool.map((c, i) => (
                  <div key={i} className="bg-white border border-amber-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 py-10 font-medium">Không có ứng viên nào.</p>
            )}
          </div>
        </div>

        {/* Reject Immediately */}
        <div className="bg-white rounded-3xl border border-rose-100 overflow-hidden flex flex-col shadow-sm">
          <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center justify-between">
            <h4 className="font-black text-rose-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Loại Thẳng Tay
            </h4>
            <span className="text-rose-600 font-bold text-sm">{report?.action_categories?.reject_immediately?.length || 0}</span>
          </div>
          <div className="p-5 flex-1 bg-gradient-to-b from-white to-rose-50/30">
            {report?.action_categories?.reject_immediately?.length > 0 ? (
              <div className="space-y-4">
                {report.action_categories.reject_immediately.map((c, i) => (
                  <div key={i} className="bg-white border border-rose-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-rose-600 leading-relaxed font-medium bg-rose-50 p-2 rounded-xl">{c.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 py-10 font-medium">Không có ứng viên bị loại.</p>
            )}
          </div>
        </div>

      </div>

      {/* 4. Insights & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-400" />
          <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
            Phân Tích Kỹ Năng (Skill Gap)
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {report?.skill_gap_analysis || "Chưa có phân tích kỹ năng."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
            Đề Xuất Hành Động cho HR
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {report?.hr_recommendation || "Tiến hành lọc ứng viên theo bảng trên."}
          </p>
        </div>
      </div>

    </div>
  );
}
