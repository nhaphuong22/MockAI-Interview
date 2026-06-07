import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, User, FileText, Filter, Eye, Star, Briefcase, ChevronRight, Bot, Zap, X } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";
import { HRAiInterviewReport } from "./HRAiInterviewReport";

const STATUS_BADGES = {
  SUBMITTED: { label: "Đã nộp", color: "text-blue-600 bg-blue-50" },
  AI_SCREENING: { label: "🔍 Đang lọc CV", color: "text-violet-600 bg-violet-50" },
  INTERVIEW_INVITED: { label: "🎯 Mời PV AI", color: "text-sky-600 bg-sky-50" },
  INTERVIEW_PENDING: { label: "⏳ Chờ PV AI", color: "text-orange-600 bg-orange-50" },
  AI_REVIEWED: { label: "AI đã duyệt", color: "text-indigo-600 bg-indigo-50" },
  HR_REVIEWING: { label: "HR Đang duyệt", color: "text-amber-600 bg-amber-50" },
  SHORTLISTED: { label: "Vào vòng trong", color: "text-emerald-600 bg-emerald-50" },
  INTERVIEW_SCHEDULED: { label: "Phỏng vấn", color: "text-purple-600 bg-purple-50" },
  HIRED: { label: "Đã tuyển", color: "text-green-700 bg-green-100" },
  REJECTED: { label: "Từ chối", color: "text-red-600 bg-red-50" },
  AUTO_REJECTED: { label: "❌ CV không đạt", color: "text-red-500 bg-red-50" },
};

const AI_TRACK_BADGES = {
  FAST_TRACK: { label: "⚡ Fast Track", color: "text-violet-700 bg-violet-100" },
  STANDARD: { label: "📋 Standard", color: "text-sky-700 bg-sky-100" },
  WAITLISTED: { label: "⏳ Hàng chờ", color: "text-orange-700 bg-orange-100" },
  AUTO_REJECTED: { label: "❌ Từ chối", color: "text-red-600 bg-red-50" },
};

export function ManageApplications() {
  const { user } = useAuthStore();
  const currentHrId = user?.id;
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportApplication, setReportApplication] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["manage-applications", currentHrId, filterStatus, filterTrack],
    queryFn: async () => {
      const response = await jobApi.getJobApplications({
        status: filterStatus || undefined,
        ai_track: filterTrack || undefined
      });
      return response.data;
    },
    enabled: !!currentHrId
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => jobApi.updateJobApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      setIsReportOpen(false);
    }
  });

  const applicationsList = Array.isArray(data) ? data : (data?.items || []);

  const handleViewReport = (app) => {
    setReportApplication(app);
    setIsReportOpen(true);
  };

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Quản Lý Ứng Viên
              <span className="px-3 py-1 bg-sky-100 text-[#0ea5e9] text-sm font-bold rounded-full">
                {applicationsList.length} hồ sơ
              </span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Theo dõi và đánh giá ứng viên cho các vị trí tuyển dụng</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mr-2 text-sm font-bold">
            <Filter className="w-4 h-4" /> Bộ lọc:
          </div>
          <button
            onClick={() => { setFilterStatus(""); setFilterTrack(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "" && filterTrack === "" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => { setFilterStatus("SUBMITTED"); setFilterTrack(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "SUBMITTED" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Chưa xử lý
          </button>
          <button
            onClick={() => { setFilterTrack("FAST_TRACK"); setFilterStatus(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterTrack === "FAST_TRACK" ? "bg-violet-500 text-white shadow-md shadow-violet-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            ⚡ Fast Track
          </button>
          <button
            onClick={() => { setFilterTrack("STANDARD"); setFilterStatus(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterTrack === "STANDARD" ? "bg-sky-500 text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            📋 Standard
          </button>
          <button
            onClick={() => { setFilterStatus("SHORTLISTED"); setFilterTrack(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "SHORTLISTED" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Vào vòng trong
          </button>
          <button
            onClick={() => { setFilterStatus("HIRED"); setFilterTrack(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "HIRED" ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            ✅ Đã tuyển
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">Đang tải danh sách ứng viên...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-red-500 font-semibold mb-2">Đã xảy ra lỗi khi tải danh sách!</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">
              Tải lại
            </button>
          </div>
        ) : applicationsList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có ứng viên nào</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Danh sách hồ sơ ứng tuyển hiện đang trống theo bộ lọc này.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ứng Viên</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vị Trí (Job)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">AI Track</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Điểm AI</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applicationsList.map((app) => (
                    <tr key={app.id} className="hover:bg-sky-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {app.candidate_avatar ? (
                              <img src={app.candidate_avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors line-clamp-1">
                              {app.candidate_name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {app.candidate_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800 line-clamp-2">
                          {app.job_title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Nộp: {new Date(app.created_at).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      {/* AI Track Badge */}
                      <td className="px-6 py-4">
                        {app.ai_track && AI_TRACK_BADGES[app.ai_track] ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${AI_TRACK_BADGES[app.ai_track].color}`}>
                            {AI_TRACK_BADGES[app.ai_track].label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Thủ công</span>
                        )}
                      </td>
                      {/* AI Scores */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            {app.cv_match_score != null && (
                              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5" /> CV: {app.cv_match_score}
                              </span>
                            )}
                            {app.interview_score != null && (
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-2.5 h-2.5" /> PV: {app.interview_score}
                              </span>
                            )}
                            {app.cv_match_score == null && app.interview_score == null && (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${STATUS_BADGES[app.status]?.color || "text-gray-600 bg-gray-100"}`}>
                          {STATUS_BADGES[app.status]?.label || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Nút Xem báo cáo AI — chỉ hiện khi có AI data */}
                          {(app.cv_match_score != null || app.interview_score != null) && (
                            <button
                              onClick={() => handleViewReport(app)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-500 hover:text-white rounded-lg transition-all"
                            >
                              <Bot className="w-3.5 h-3.5" /> Báo cáo AI
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-[#0ea5e9] hover:text-white rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ApplicationDetailModal 
          key={selectedApplication?.id || "empty"}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          application={selectedApplication}
        />

        {/* AI Report Drawer */}
        {isReportOpen && reportApplication && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsReportOpen(false)}
            />
            {/* Drawer */}
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-violet-500" />
                  <span className="font-bold text-slate-800">Báo cáo AI — {reportApplication.candidate_name}</span>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-4">
                <HRAiInterviewReport
                  application={reportApplication}
                  onAccept={() => updateStatusMutation.mutate({ id: reportApplication.id, status: "HIRED" })}
                  onReject={() => updateStatusMutation.mutate({ id: reportApplication.id, status: "REJECTED" })}
                  isUpdating={updateStatusMutation.isPending}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageApplications;
