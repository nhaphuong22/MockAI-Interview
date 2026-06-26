import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, Users, User, Filter, Eye, Briefcase,
  Sparkles, Phone, CheckCircle2, X, Clock, BarChart2, ArrowUpDown, Star
} from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";

const STATUS_BADGES = {
  SUBMITTED:            { label: "Đã nộp",         color: "text-blue-600 bg-blue-50 border-blue-100" },
  AI_REVIEWED:          { label: "AI đã duyệt",     color: "text-[#0ea5e9] bg-sky-50 border-sky-100" },
  HR_REVIEWING:         { label: "HR Đang duyệt",   color: "text-amber-600 bg-amber-50 border-amber-100" },
  SHORTLISTED:          { label: "Vào vòng trong",  color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  AI_INTERVIEW_INVITED: { label: "Đã mời PV AI",    color: "text-sky-600 bg-sky-50 border-sky-100" },
  INTERVIEWED:          { label: "Có kết quả PV",   color: "text-violet-600 bg-violet-50 border-violet-100" },
  INTERVIEW_SCHEDULED:  { label: "Lịch phỏng vấn",  color: "text-purple-600 bg-purple-50 border-purple-100" },
  HIRED:                { label: "Đã tuyển",        color: "text-green-700 bg-green-100 border-green-200" },
  REJECTED:             { label: "Từ chối",         color: "text-red-600 bg-red-50 border-red-100" },
};

// Derive PASS/FAIL badge from aiFeedback
function getAIVerdict(app) {
  const feedback = app.aiFeedback;
  if (!feedback) return null;
  const isPassed = feedback.knockout_status !== "REJECTED";
  return {
    passed: isPassed,
    score: feedback.semantic_score ?? app.cv_score ?? 0,
  };
}

// Label + style for action button per phase
function getActionMeta(status) {
  if (["INTERVIEWED", "HIRED"].includes(status)) {
    return { label: "Xem KQ Phỏng Vấn", className: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-white" };
  }
  if (["SHORTLISTED", "AI_INTERVIEW_INVITED"].includes(status)) {
    return { label: "Quản lý PV AI", className: "text-[#0ea5e9] bg-sky-50 border-sky-200 hover:bg-[#0ea5e9] hover:text-white" };
  }
  return { label: "Duyệt Hồ Sơ", className: "text-sky-700 bg-sky-50 border-sky-200 hover:bg-[#0ea5e9] hover:text-white" };
}

export function ManageApplications() {
  const { user } = useAuthStore();
  const currentHrId = user?.id;

  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(jobId || "all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortByScore, setSortByScore] = useState(true); // default sort by cv_score desc

  // Query 1: Lấy tất cả Jobs của HR
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["hr-jobs", currentHrId],
    queryFn: async () => {
      const response = await jobApi.getJobs({ hr_id: currentHrId, limit: 100 });
      return response.data;
    },
    enabled: !!currentHrId,
  });
  const jobsList = jobsResponse?.items || [];

  // Query 2: Toàn bộ applications để tính badge count
  const { data: allAppsResponse } = useQuery({
    queryKey: ["all-hr-applications", currentHrId],
    queryFn: async () => {
      const response = await jobApi.getJobApplications();
      return response.data;
    },
    enabled: !!currentHrId,
  });
  const allApplications = Array.isArray(allAppsResponse) ? allAppsResponse : [];

  // Query 3: Applications theo Job + filter
  const { data: appsResponse, isLoading: isLoadingApps, isError, refetch } = useQuery({
    queryKey: ["manage-applications", currentHrId, selectedJobId, filterStatus],
    queryFn: async () => {
      const response = await jobApi.getJobApplications({
        job_id: selectedJobId === "all" ? undefined : selectedJobId,
        status: filterStatus || undefined,
      });
      return response.data;
    },
    enabled: !!currentHrId,
  });

  const rawList = useMemo(
    () => (Array.isArray(appsResponse) ? appsResponse : []),
    [appsResponse]
  );

  // Sort: by cv_score desc (default) or original order
  const applicationsList = useMemo(() => {
    if (!sortByScore) return rawList;
    return [...rawList].sort((a, b) => (b.cv_score ?? 0) - (a.cv_score ?? 0));
  }, [rawList, sortByScore]);

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const getAppCountForJob = (jId) => {
    if (jId === "all") return allApplications.length;
    return allApplications.filter((app) => app.job_id === jId).length;
  };

  const activeJobInfo = jobsList.find((job) => job.id === selectedJobId);
  const jobTitle = selectedJobId !== "all" ? activeJobInfo?.title : null;

  // Filter shortcuts map with counts
  const QUICK_FILTERS = useMemo(() => {
    const currentApps = selectedJobId === "all" 
      ? allApplications 
      : allApplications.filter(a => a.job_id === selectedJobId);

    return [
      { label: "Tất cả", value: "", count: currentApps.length },
      { label: "Chưa xử lý", value: "SUBMITTED", count: currentApps.filter(a => a.status === "SUBMITTED" || a.status === "AI_REVIEWED").length },
      { label: "Vòng trong", value: "SHORTLISTED", count: currentApps.filter(a => a.status === "SHORTLISTED").length },
      { label: "Đã mời PV", value: "AI_INTERVIEW_INVITED", count: currentApps.filter(a => a.status === "AI_INTERVIEW_INVITED").length },
      { label: "Có KQ PV", value: "INTERVIEWED", count: currentApps.filter(a => a.status === "INTERVIEWED").length },
      { label: "Đã tuyển", value: "HIRED", count: currentApps.filter(a => a.status === "HIRED").length },
      { label: "Từ chối", value: "REJECTED", count: currentApps.filter(a => a.status === "REJECTED").length },
    ];
  }, [allApplications, selectedJobId]);

  return (
    <div className="bg-gray-50/50 min-h-screen pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[500px] lg:max-w-[600px]" title={jobTitle ? `Chiến dịch: ${jobTitle}` : "Hộp Thư Ứng Viên Tổng"}>
                {jobTitle ? `Chiến dịch: ${jobTitle}` : "Hộp Thư Ứng Viên Tổng"}
              </span>
              <span className="shrink-0 whitespace-nowrap px-3 py-1 bg-sky-100 text-[#0ea5e9] text-sm font-bold rounded-full">
                {applicationsList.length} hồ sơ
              </span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium text-sm">
              {jobTitle
                ? "Danh sách hồ sơ ứng viên nộp vào chiến dịch này"
                : "Theo dõi và đánh giá ứng viên cho tất cả các vị trí tuyển dụng"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/hr/dashboard/shortlist"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              <Star className="w-4 h-4 fill-white" />
              Bảng Chọn Lọc
            </Link>
            {selectedJobId !== "all" && jobTitle && (
              <Link
                to={`/hr/dashboard/campaign/${selectedJobId}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Báo Cáo Chiến Dịch AI
              </Link>
            )}
          </div>
        </div>


        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar: Job list */}
          <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0ea5e9]" /> Tin đăng tuyển dụng
            </h2>
            {isLoadingJobs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {/* All jobs */}
                <button
                  onClick={() => setSelectedJobId("all")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all border ${
                    selectedJobId === "all"
                      ? "bg-sky-50 text-[#0ea5e9] border-sky-200 font-bold"
                      : "text-gray-600 hover:bg-gray-50 border-transparent font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${selectedJobId === "all" ? "text-[#0ea5e9]" : "text-gray-400"}`} />
                    <span className="text-sm">Tất cả công việc</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedJobId === "all" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {getAppCountForJob("all")}
                  </span>
                </button>

                {jobsList.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex flex-col gap-1.5 transition-all border ${
                        isSelected
                          ? "bg-sky-50/70 border-sky-200 text-[#0ea5e9]"
                          : "hover:bg-gray-50 border-transparent text-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm line-clamp-2 ${isSelected ? "font-bold" : "font-semibold"}`}>
                          {job.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${isSelected ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-500"}`}>
                          {getAppCountForJob(job.id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${job.status === "OPEN" ? "bg-sky-100 text-[#0ea5e9]" : "bg-gray-100 text-gray-500"}`}>
                          {job.status === "OPEN" ? "ĐANG TUYỂN" : "ĐÃ ĐÓNG"}
                        </span>
                        {job.vacancy_count && (
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {job.vacancy_count} chỉ tiêu
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column: Applications table */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

            {/* Table header controls */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedJobId === "all" ? "Tất cả đơn ứng tuyển" : activeJobInfo?.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedJobId === "all"
                      ? "Xem toàn bộ ứng viên đăng ký vào tất cả các vị trí"
                      : `Ứng viên nộp cho vị trí: ${activeJobInfo?.title}`}
                  </p>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-bold mr-1">
                    <Filter className="w-3.5 h-3.5" /> Lọc:
                  </div>
                  {QUICK_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilterStatus(f.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filterStatus === f.value
                          ? "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20 border border-[#0ea5e9]"
                          : "text-gray-600 hover:bg-sky-50 hover:text-[#0ea5e9] bg-gray-100/50 border border-transparent"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] leading-none ${
                        filterStatus === f.value ? "bg-white/20" : "bg-gray-200/60"
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
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
                  <Users className="w-16 h-16 text-sky-100 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có ứng viên nào</h3>
                  <p className="text-gray-500 text-sm max-w-sm font-medium">
                    {filterStatus
                      ? "Không tìm thấy hồ sơ nào khớp với bộ lọc này."
                      : "Vị trí tuyển dụng này hiện chưa nhận được hồ sơ nào."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ứng Viên</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => setSortByScore((v) => !v)}
                            className="flex items-center gap-1.5 hover:text-[#0ea5e9] transition-colors"
                            title="Nhấn để thay đổi sắp xếp"
                          >
                            Kết quả AI
                            <ArrowUpDown className={`w-3.5 h-3.5 ${sortByScore ? "text-[#0ea5e9]" : "text-gray-400"}`} />
                          </button>
                        </th>
                        <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm PV</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applicationsList.map((app) => {
                        let displayData = {
                          name: app.candidate_name,
                          email: app.candidate_email,
                          phone: app.candidate_phone,
                          address: null,
                        };
                        if (app.cv_text) {
                          const lines = app.cv_text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
                          if (lines.length > 0) {
                            displayData.name = lines[0]; // Usually the first line is the name
                            
                            const emailMatch = app.cv_text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
                            if (emailMatch && !emailMatch[0].endsWith('.')) {
                              displayData.email = emailMatch[0];
                            }
                            
                            // SĐT VN hợp lệ: bắt đầu bằng +84 hoặc 0, theo sau là đầu số 3,5,7,8,9 và 8 chữ số (cho phép khoảng trắng/dấu chấm/gạch ngang)
                            const phoneMatch = app.cv_text.match(/(?:\+84|0)[\s.-]*[35789](?:[\s.-]*\d){8}\b/);
                            if (phoneMatch) displayData.phone = phoneMatch[0].replace(/[\s.-]/g, '');
                            const addressMatch = app.cv_text.match(/(?:Địa chỉ|Address|Location):\s*([^\n]+)/i);
                            if (addressMatch) displayData.address = addressMatch[1]?.trim();
                          }
                        }

                        const aiVerdict = getAIVerdict(app);
                        const actionMeta = getActionMeta(app.status);
                        const hasInterviewScore = app.interview_score != null;

                        return (
                          <tr
                            key={app.id}
                            onClick={() => handleViewDetails(app)}
                            className="hover:bg-sky-50/30 transition-all group cursor-pointer"
                          >
                            {/* Ứng viên */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                  {app.candidate_avatar ? (
                                    <img src={app.candidate_avatar} alt="avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors line-clamp-1 text-sm">
                                    {displayData.name}
                                  </div>
                                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{displayData.email}</div>
                                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    {displayData.phone || "Chưa cập nhật"}
                                  </div>
                                  {selectedJobId === "all" && (
                                    <div className="text-[10px] font-bold text-[#0ea5e9] mt-1 flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" /> {app.jobTitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Kết quả AI (cv_score + PASS/FAIL) */}
                            <td className="px-5 py-4">
                              {aiVerdict ? (
                                <div className="flex flex-col gap-1.5">
                                  {/* Score bar */}
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-black ${
                                      aiVerdict.score >= 70 ? "text-emerald-600"
                                      : aiVerdict.score >= 50 ? "text-amber-600"
                                      : "text-red-500"
                                    }`}>
                                      {aiVerdict.score}
                                    </span>
                                    <div className="flex-1 min-w-[48px]">
                                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            aiVerdict.score >= 70 ? "bg-emerald-500"
                                            : aiVerdict.score >= 50 ? "bg-amber-500"
                                            : "bg-red-500"
                                          }`}
                                          style={{ width: `${aiVerdict.score}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {/* PASS/FAIL badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black w-fit ${
                                    aiVerdict.passed
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }`}>
                                    {aiVerdict.passed
                                      ? <><CheckCircle2 className="w-3 h-3" /> PASS</>
                                      : <><X className="w-3 h-3" /> FAIL</>
                                    }
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Chưa chấm</span>
                              )}
                            </td>

                            {/* Điểm PV AI */}
                            <td className="px-5 py-4">
                              {hasInterviewScore ? (
                                <div className="flex flex-col gap-1">
                                  <span className={`text-sm font-black ${
                                    app.interview_score >= 70 ? "text-emerald-600"
                                    : app.interview_score >= 50 ? "text-amber-600"
                                    : "text-red-500"
                                  }`}>
                                    {app.interview_score}
                                  </span>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        app.interview_score >= 70 ? "bg-emerald-500"
                                        : app.interview_score >= 50 ? "bg-amber-500"
                                        : "bg-red-500"
                                      }`}
                                      style={{ width: `${app.interview_score}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">—</span>
                              )}
                            </td>

                            {/* Trạng thái */}
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block border ${
                                STATUS_BADGES[app.status]?.color || "text-gray-600 bg-gray-100 border-gray-200"
                              }`}>
                                {STATUS_BADGES[app.status]?.label || app.status}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewDetails(app); }}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border shadow-sm ${actionMeta.className}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                {actionMeta.label}
                              </button>
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
