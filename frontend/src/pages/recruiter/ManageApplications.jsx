import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, User, FileText, Filter, Eye, Star, Briefcase, ChevronRight } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";

const STATUS_BADGES = {
  SUBMITTED: { label: "Đã nộp", color: "text-blue-600 bg-blue-50" },
  AI_REVIEWED: { label: "AI duyệt", color: "text-indigo-600 bg-indigo-50" },
  HR_REVIEWING: { label: "HR Đang duyệt", color: "text-amber-600 bg-amber-50" },
  SHORTLISTED: { label: "Vào vòng trong", color: "text-emerald-600 bg-emerald-50" },
  INTERVIEW_SCHEDULED: { label: "Phỏng vấn", color: "text-purple-600 bg-purple-50" },
  ACCEPTED: { label: "Đã trúng tuyển", color: "text-emerald-700 bg-emerald-100" },
  HIRED: { label: "Đã tuyển", color: "text-green-700 bg-green-100" },
  REJECTED: { label: "Từ chối", color: "text-red-600 bg-red-50" }
};

export function ManageApplications() {
  const { user } = useAuthStore();
  const currentHrId = user?.id;

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["manage-applications", currentHrId, filterStatus],
    queryFn: async () => {
      const response = await jobApi.getJobApplications({
        status: filterStatus || undefined
      });
      return response.data; // Because response.data contains the array directly
    },
    enabled: !!currentHrId
  });

  const applicationsList = Array.isArray(data) ? data : (data?.items || []);

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
            onClick={() => setFilterStatus("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus("SUBMITTED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "SUBMITTED" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Chưa xử lý
          </button>
          <button
            onClick={() => setFilterStatus("SHORTLISTED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "SHORTLISTED" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Vào vòng trong
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
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Điểm AI</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nhãn (Tag)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applicationsList.map((app) => (
                    <tr 
                      key={app.id} 
                      onClick={() => handleViewDetails(app)}
                      className="hover:bg-sky-50/40 transition-all group cursor-pointer"
                    >
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 font-black text-sm" title="Total Score">
                            {app.total_score || 0}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex gap-1 items-center">
                              <FileText className="w-3 h-3 text-sky-500" /> CV: {app.cv_score || 0}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex gap-1 items-center">
                              <Star className="w-3 h-3 text-indigo-500" /> PV: {app.interview_score || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${STATUS_BADGES[app.status]?.color || "text-gray-600 bg-gray-100"}`}>
                          {STATUS_BADGES[app.status]?.label || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.hr_tag ? (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold">
                            {app.hr_tag}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status === "INTERVIEWED" || app.status === "ACCEPTED" || app.status === "HIRED" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(app); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 hover:bg-fuchsia-600 hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" /> Đánh giá AI
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(app); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-[#0ea5e9] hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> Duyệt Hồ Sơ
                          </button>
                        )}
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
      </div>
    </div>
  );
}

export default ManageApplications;
