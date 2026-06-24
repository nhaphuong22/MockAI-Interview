import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { Sparkles, Users, UserCheck, UserX, Target, Loader2, ShieldAlert, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";

export function CampaignAIReport({ jobId }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => jobApi.updateJobApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      showToast("Đã cập nhật trạng thái ứng viên thành công!", "success");
    },
    onError: (error) => {
      console.error("Lỗi cập nhật trạng thái:", error);
      showToast("Lỗi khi cập nhật trạng thái!", "error");
    }
  });

  const handleAction = (id, status) => {
    if (!id) {
      showToast("Lỗi: Không tìm thấy ID ứng viên (Cần tạo lại báo cáo mới)", "error");
      return;
    }
    updateStatusMutation.mutate({ id, status });
  };
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["campaign-ai-report", jobId],
    queryFn: async () => {
      const response = await jobApi.getJobCampaignReport(jobId);
      return response.data;
    },
    enabled: true, // Tự động chạy
    retry: false
  });

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/30 to-purple-50/30 animate-pulse -z-10" />
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hệ thống AI đang phân tích dữ liệu...</h3>
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
        <p className="text-gray-500 mb-6 max-w-md text-sm">{error?.response?.data?.message || "Lỗi hệ thống khi gọi AI Phân Tích."}</p>
        <button onClick={() => refetch()} className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold transition-colors">
          Thử lại
        </button>
      </div>
    );
  }

  const report = data; // Vì queryFn đã return response.data nên data chính là object report
  const stats = report?.statistics;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-500 transform ${
            toast.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          } ${
            toast.type === "success" 
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" 
              : "bg-rose-50/90 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
              <span className="text-rose-500 font-bold text-sm">!</span>
            </div>
          )}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
      
      {/* 0. Cache Header (Nếu có) */}
      {report?.is_cached && report?.generated_at && (
        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Đã tải báo cáo từ bộ nhớ đệm (Cache)</p>
              <p className="text-xs text-blue-700">Dữ liệu được tạo vào lúc {new Date(report.generated_at).toLocaleString('vi-VN')} và chưa có sự thay đổi mới nào từ ứng viên.</p>
            </div>
          </div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-xl border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors"
          >
            Làm mới
          </button>
        </div>
      )}

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
                  <div key={i} className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 line-clamp-1 flex-1 pr-2">{c.name}</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg shrink-0">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed flex-1 mb-3">{c.reason}</p>
                    <button
                      onClick={() => handleAction(c.id, "INTERVIEWED")}
                      disabled={updateStatusMutation.isPending}
                      className="mt-auto w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-emerald-200"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Duyệt Phỏng Vấn
                    </button>
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
                  <div key={i} className="bg-white border border-amber-100 p-4 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 line-clamp-1 flex-1 pr-2">{c.name}</span>
                      <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-lg shrink-0">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed flex-1 mb-3">{c.reason}</p>
                    <button
                      onClick={() => handleAction(c.id, "REVIEWED")}
                      disabled={updateStatusMutation.isPending}
                      className="mt-auto w-full flex items-center justify-center gap-2 py-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-amber-200"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                      Chờ Xem Xét
                    </button>
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
                  <div key={i} className="bg-white border border-rose-100 p-4 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 line-clamp-1 flex-1 pr-2">{c.name}</span>
                      <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg shrink-0">{c.score} đ</span>
                    </div>
                    <p className="text-xs text-rose-600 leading-relaxed font-medium bg-rose-50 p-2 rounded-xl flex-1 mb-3">{c.reason}</p>
                    <button
                      onClick={() => handleAction(c.id, "REJECTED")}
                      disabled={updateStatusMutation.isPending}
                      className="mt-auto w-full flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-200"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Từ Chối Ứng Viên
                    </button>
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
