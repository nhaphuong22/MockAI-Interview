import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, User, FileText, Filter, Eye, Star, Briefcase, Sparkles, Phone, MapPin } from "lucide-react";
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

  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(jobId || "all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Query 1: Lấy tất cả các Job do HR hiện tại đăng tuyển để làm Sidebar bên trái
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["hr-jobs", currentHrId],
    queryFn: async () => {
      const response = await jobApi.getJobs({
        hr_id: currentHrId,
        limit: 100 // Lấy toàn bộ Jobs của HR này
      });
      return response.data;
    },
    enabled: !!currentHrId
  });
  const jobsList = jobsResponse?.items || [];

  // Query 2: Lấy toàn bộ đơn ứng tuyển (không lọc jobId) của HR để đếm badge số lượng ứng viên cho từng Job
  const { data: allAppsResponse } = useQuery({
    queryKey: ["all-hr-applications", currentHrId],
    queryFn: async () => {
      const response = await jobApi.getJobApplications();
      return response.data;
    },
    enabled: !!currentHrId
  });
  const allApplications = Array.isArray(allAppsResponse) ? allAppsResponse : [];

  // Query 3: Lấy danh sách hồ sơ ứng tuyển theo Job được chọn ở cột trái và theo Bộ lọc trạng thái
  const { data: appsResponse, isLoading: isLoadingApps, isError, refetch } = useQuery({
    queryKey: ["manage-applications", currentHrId, selectedJobId, filterStatus],
    queryFn: async () => {
      const response = await jobApi.getJobApplications({
        job_id: selectedJobId === "all" ? undefined : selectedJobId,
        status: filterStatus || undefined
      });
      return response.data;
    },
    enabled: !!currentHrId
  });
  const applicationsList = Array.isArray(appsResponse) ? appsResponse : [];

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  // Tính số lượng ứng viên cho mỗi Job dựa trên danh sách allApplications
  const getAppCountForJob = (jobId) => {
    if (jobId === "all") return allApplications.length;
    return allApplications.filter(app => app.jobId === jobId).length;
  };

  // Lấy thông tin Job đang được chọn
  const activeJobInfo = jobsList.find(job => job.id === selectedJobId);
  const jobTitle = selectedJobId !== "all" ? activeJobInfo?.title : null;

  return (
    <div className="bg-gray-50/50 min-h-screen pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex flex-wrap items-center gap-3">
              <span>{jobTitle ? `Chiến dịch: ${jobTitle}` : "Hộp Thư Ứng Viên Tổng"}</span>
              <span className="shrink-0 whitespace-nowrap px-3 py-1 bg-sky-100 text-[#0ea5e9] text-sm font-bold rounded-full">
                {applicationsList.length} hồ sơ
              </span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              {jobTitle 
                ? "Danh sách hồ sơ ứng viên nộp vào chiến dịch này" 
                : "Theo dõi và đánh giá ứng viên cho tất cả các vị trí tuyển dụng"}
            </p>
          </div>
          
          {/* Nút Xem Báo Cáo AI (Chỉ hiện khi chọn 1 chiến dịch cụ thể) */}
          {selectedJobId !== "all" && jobTitle && (
            <Link
              to={`/hr/dashboard/campaign/${selectedJobId}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Báo Cáo Chiến Dịch AI
            </Link>
          )}
        </div>

        {/* Main Content Layout - Split-pane */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Cột trái (Sidebar): Danh sách Jobs */}
          <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0ea5e9]" /> Tin đăng tuyển dụng
            </h2>
            
            {isLoadingJobs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {/* Mục "Tất cả công việc" */}
                <button
                  onClick={() => setSelectedJobId("all")}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between transition-all group ${
                    selectedJobId === "all"
                      ? "bg-sky-50 text-[#0ea5e9] border border-sky-100 font-bold"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4.5 h-4.5 ${selectedJobId === "all" ? "text-[#0ea5e9]" : "text-gray-400"}`} />
                    <span className="text-sm">Tất cả công việc</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedJobId === "all" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {getAppCountForJob("all")}
                  </span>
                </button>

                {/* Danh sách từng Job */}
                {jobsList.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  const appCount = getAppCountForJob(job.id);
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl flex flex-col gap-1.5 transition-all border ${
                        isSelected
                          ? "bg-sky-50/50 border-sky-200 text-[#0ea5e9]"
                          : "hover:bg-gray-50 border-transparent text-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm line-clamp-2 ${isSelected ? "font-bold" : "font-semibold"}`}>
                          {job.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                          isSelected ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {appCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          job.status === "OPEN" 
                            ? "bg-sky-100 text-[#0ea5e9]" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {job.status === "OPEN" ? "ĐANG TUYỂN" : "ĐÃ ĐÓNG"}
                        </span>
                        {job.vacancy_count && (
                          <span className="text-[10px] text-gray-400 font-semibold">
                            Tuyển {job.vacancy_count} chỉ tiêu
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cột phải: Danh sách ứng viên cho Job được chọn */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header Cột phải */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {selectedJobId === "all" ? "Tất cả đơn ứng tuyển" : activeJobInfo?.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {selectedJobId === "all" 
                      ? "Xem toàn bộ ứng viên đăng ký vào tất cả các vị trí tuyển dụng" 
                      : `Danh sách ứng viên nộp cho vị trí: ${activeJobInfo?.title}`}
                  </p>
                </div>
                
                {/* Bộ lọc trạng thái */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mr-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
                  </div>
                  <button
                    onClick={() => setFilterStatus("")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === "" 
                        ? "bg-[#0ea5e9] text-white shadow-sm" 
                        : "text-gray-600 hover:bg-gray-50 bg-gray-100/50"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterStatus("SUBMITTED")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === "SUBMITTED" 
                        ? "bg-[#0ea5e9] text-white shadow-sm" 
                        : "text-gray-600 hover:bg-gray-50 bg-gray-100/50"
                    }`}
                  >
                    Chưa xử lý
                  </button>
                  <button
                    onClick={() => setFilterStatus("SHORTLISTED")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === "SHORTLISTED" 
                        ? "bg-[#0ea5e9] text-white shadow-sm" 
                        : "text-gray-600 hover:bg-gray-50 bg-gray-100/50"
                    }`}
                  >
                    Vòng trong
                  </button>
                </div>
              </div>
            </div>

            {/* Bảng Danh sách Ứng Viên */}
            <div className="flex-1">
              {isLoadingApps ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white">
                  <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
                  <p className="text-gray-500 text-sm font-medium">Đang tải danh sách ứng viên...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-16 bg-white">
                  <p className="text-red-500 font-semibold mb-2">Đã xảy ra lỗi khi tải danh sách ứng viên!</p>
                  <button onClick={() => refetch()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">
                    Tải lại
                  </button>
                </div>
              ) : applicationsList.length === 0 ? (
                <div className="text-center py-24 bg-white flex flex-col items-center justify-center">
                  <Users className="w-16 h-16 text-sky-100 mb-4 stroke-1.5" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có ứng viên nào</h3>
                  <p className="text-gray-500 text-sm max-w-sm font-medium">
                    {filterStatus 
                      ? "Không tìm thấy hồ sơ ứng tuyển nào khớp với bộ lọc trạng thái này."
                      : "Vị trí tuyển dụng này hiện chưa nhận được hồ sơ ứng tuyển nào."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ứng Viên</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Điểm AI</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Phân loại (Tag)</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applicationsList.map((app) => {
                        // Extract data from parsed CV text if available
                        let displayData = {
                          name: app.candidate_name,
                          email: app.candidate_email,
                          phone: app.candidate_phone,
                          address: null
                        };

                        if (app.cv_text) {
                          const lines = app.cv_text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                          if (lines.length > 0) {
                            displayData.name = lines[0]; // Usually the first line is the name
                            
                            const emailMatch = app.cv_text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                            if (emailMatch) displayData.email = emailMatch[0];
                            
                            const phoneMatch = app.cv_text.match(/(?:\+84|0)(?:\s?\d){9,10}/);
                            if (phoneMatch) displayData.phone = phoneMatch[0];
                            
                            const addressMatch = app.cv_text.match(/(?:Địa chỉ|Address|Location):\s*([^\n]+)/i);
                            if (addressMatch) displayData.address = addressMatch[1].trim();
                          }
                        }

                        return (
                        <tr 
                          key={app.id} 
                          onClick={() => handleViewDetails(app)}
                          className="hover:bg-sky-50/30 transition-all group cursor-pointer"
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
                                  {displayData.name}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {displayData.email}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  {displayData.phone || "Chưa cập nhật"}
                                </div>
                                {displayData.address && (
                                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    {displayData.address}
                                  </div>
                                )}
                                {selectedJobId === "all" && (
                                  <div className="text-[10px] font-bold text-[#0ea5e9] mt-1 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> {app.jobTitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 font-black text-sm" title="Total Score">
                                {app.total_score || 0}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex gap-1 items-center">
                                  <FileText className="w-2.5 h-2.5 text-sky-500" /> CV: {app.cv_score || 0}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex gap-1 items-center">
                                  <Star className="w-2.5 h-2.5 text-indigo-500" /> PV: {app.interview_score || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                              STATUS_BADGES[app.status]?.color || "text-gray-600 bg-gray-100"
                            }`}>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

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
