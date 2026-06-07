import { FileText, Users, CheckCircle, XCircle, Eye, Download, Filter, TrendingUp, Calendar, ChevronDown, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationApi } from "../../api/applicationApi";
import { useUiStore } from "../../store/useUiStore";
import * as Dialog from "@radix-ui/react-dialog";

const statusConfig = {
  submitted: { label: "Mới tiếp nhận", color: "bg-blue-50 text-blue-600 border border-blue-100" },
  reviewing: { label: "Đang xem hồ sơ", color: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
  interviewed: { label: "Mời phỏng vấn", color: "bg-purple-50 text-purple-600 border border-purple-100" },
  accepted: { label: "Đạt (Hired)", color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  rejected: { label: "Từ chối", color: "bg-rose-50 text-rose-600 border border-rose-100" },
  new: { label: "Mới tiếp nhận", color: "bg-blue-50 text-blue-600 border border-blue-100" },
  reviewed: { label: "Đang xem hồ sơ", color: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
};

export function HRDashboard() {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showAIReport, setShowAIReport] = useState(false);
  const [activeTab, setActiveTab] = useState("report"); // 'report' hoặc 'cv'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");

  const getCvFullUrl = (cvUrl) => {
    if (!cvUrl) return "";
    if (cvUrl.startsWith("http://") || cvUrl.startsWith("https://")) {
      return cvUrl;
    }
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}/${cvUrl}`;
  };

  const queryClient = useQueryClient();
  const { showToast } = useUiStore();

  // Fetch danh sách đơn ứng tuyển thực tế từ DB
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["recruiter-applications"],
    queryFn: async () => {
      const res = await applicationApi.getApplications();
      return res; // Axios interceptor đã bóc tách response.data
    }
  });

  // Mutation cập nhật trạng thái đơn tuyển
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationApi.updateStatus(id, status),
    onSuccess: (data) => {
      showToast({ message: "Cập nhật trạng thái hồ sơ ứng viên thành công!", type: "success" });
      queryClient.invalidateQueries(["recruiter-applications"]);
      setShowAIReport(false);
    },
    onError: (error) => {
      console.error(error);
      showToast({ message: error.response?.data?.message || "Cập nhật trạng thái thất bại.", type: "error" });
    }
  });

  const rawApplications = response?.data || [];

  // Lọc và tìm kiếm
  const applications = rawApplications.filter((app) => {
    const nameMatches = app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatches = app.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatches = nameMatches || emailMatches;

    if (statusFilter === "Tất cả trạng thái") return searchMatches;
    if (statusFilter === "Mới tiếp nhận") return searchMatches && (app.status === "submitted" || app.status === "new");
    if (statusFilter === "Đang xem hồ sơ") return searchMatches && (app.status === "reviewing" || app.status === "reviewed");
    if (statusFilter === "Mời phỏng vấn") return searchMatches && app.status === "interviewed";
    if (statusFilter === "Đã chấp nhận") return searchMatches && app.status === "accepted";
    if (statusFilter === "Đã từ chối") return searchMatches && app.status === "rejected";

    return searchMatches;
  });

  const selectedCandidate = rawApplications.find((c) => c.id === selectedCandidateId);

  // Tính toán các chỉ số stats thực tế
  const totalCount = rawApplications.length;
  const interviewedCount = rawApplications.filter(a => a.status === "interviewed").length;
  const reviewingCount = rawApplications.filter(a => a.status === "submitted" || a.status === "new" || a.status === "reviewing" || a.status === "reviewed").length;
  const acceptedCount = rawApplications.filter(a => a.status === "accepted").length;

  const stats = [
    { icon: FileText, label: "Tổng Đơn", value: totalCount, trend: `+${totalCount}`, color: "bg-blue-500" },
    { icon: CheckCircle, label: "Mời Phỏng Vấn", value: interviewedCount, trend: `${interviewedCount}`, color: "bg-purple-500" },
    { icon: Users, label: "Đang Xét", value: reviewingCount, trend: `${reviewingCount}`, color: "bg-sky-500" },
    { icon: TrendingUp, label: "Đạt (Hired)", value: acceptedCount, trend: `${acceptedCount}`, color: "bg-green-500" },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50/60 border border-emerald-100";
    if (score >= 60) return "text-sky-700 bg-sky-50/60 border border-sky-100";
    return "text-rose-700 bg-rose-50/60 border border-rose-100";
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm shadow-emerald-100";
    if (score >= 60) return "bg-gradient-to-r from-sky-400 to-[#0ea5e9] shadow-sm shadow-sky-100";
    return "bg-gradient-to-r from-rose-400 to-rose-500 shadow-sm shadow-rose-100";
  };

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản trị Tuyển dụng</h1>
            <p className="text-gray-600 font-medium">Theo dõi ứng viên và phân tích chất lượng bằng AI</p>
          </div>
          <button className="px-6 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all flex items-center gap-2 shadow-md shadow-sky-100 cursor-pointer">
            <Download className="w-5 h-5" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-inner`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                    {stat.trend}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{isLoading ? "..." : stat.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex gap-4 w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm ứng viên theo tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-sky-50 transition-all flex items-center gap-2 font-bold text-gray-600 cursor-pointer">
                  <Filter className="w-5 h-5" />
                  <span>Bộ lọc</span>
                </button>
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none font-bold text-gray-700 min-w-[200px]"
              >
                <option>Tất cả trạng thái</option>
                <option>Mới tiếp nhận</option>
                <option>Đang xem hồ sơ</option>
                <option>Mời phỏng vấn</option>
                <option>Đã chấp nhận</option>
                <option>Đã từ chối</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
              <p className="text-gray-500 font-semibold text-sm">Đang tải danh sách hồ sơ ứng tuyển...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 font-bold">
              Đã xảy ra lỗi khi lấy thông tin ứng viên. Vui lòng reload trang!
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium">
              Không có ứng viên nào khớp với bộ lọc tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ứng Viên</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vị Trí</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Score</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kỹ Năng chính (AI)</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng Thái</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày Nộp</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-sky-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            {candidate.candidateAvatar && (candidate.candidateAvatar.startsWith("http") || candidate.candidateAvatar.startsWith("/") || candidate.candidateAvatar.includes("upload")) ? (
                              <img src={candidate.candidateAvatar} alt={candidate.candidateName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {candidate.candidateName?.substring(0, 1).toUpperCase() || "👨‍💻"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors">{candidate.candidateName}</div>
                            <div className="text-xs text-gray-500">{candidate.candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-700">{candidate.jobTitle}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{candidate.companyName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-[80px]">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getScoreBarColor(candidate.aiScore)} transition-all duration-500`}
                                style={{ width: `${candidate.aiScore}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${getScoreColor(candidate.aiScore)}`}>
                            {candidate.aiScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const skills = candidate.aiSummary ? candidate.aiSummary.split(", ") : ["React", "JavaScript"];
                            const shortSkills = skills.filter(s => s.length < 15);
                            if (shortSkills.length > 0) {
                               return shortSkills.slice(0, 3).map((skill) => (
                                 <span
                                   key={skill}
                                   className="px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-md text-[10px] font-bold uppercase border border-sky-100"
                                 >
                                   {skill}
                                 </span>
                               ));
                            }
                            // Rút gọn với câu nhận xét dài (bản ghi cũ)
                            return skills.slice(0, 1).map((phrase) => (
                               <span
                                 key={phrase}
                                 className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-medium border border-slate-100 max-w-[140px] truncate block cursor-help"
                                 title={phrase}
                               >
                                 {phrase}
                               </span>
                            ));
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap inline-block ${statusConfig[candidate.status]?.color || "bg-gray-50 text-gray-500 border border-gray-100"}`}>
                          {statusConfig[candidate.status]?.label || candidate.status}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                           <Calendar className="w-3.5 h-3.5" />
                           <span>{new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {candidate.cvUrl && (
                            <button
                              onClick={() => {
                                setSelectedCandidateId(candidate.id);
                                setShowAIReport(true);
                                setActiveTab("cv");

                                if (candidate.status === "submitted" || candidate.status === "new") {
                                  updateStatusMutation.mutate({ id: candidate.id, status: "reviewed" });
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl hover:scale-110 active:scale-95 border border-transparent hover:border-sky-100 transition-all cursor-pointer"
                              title="Xem CV gốc (PDF)"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCandidateId(candidate.id);
                              setShowAIReport(true);
                              setActiveTab("report");

                              if (candidate.status === "submitted" || candidate.status === "new") {
                                  updateStatusMutation.mutate({ id: candidate.id, status: "reviewed" });
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl hover:scale-110 active:scale-95 border border-transparent hover:border-sky-100 transition-all cursor-pointer"
                            title="Xem chi tiết AI Report"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Report Modal */}
        <Dialog.Root open={showAIReport} onOpenChange={setShowAIReport}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50 animate-in zoom-in-95 duration-300 outline-none">
              {selectedCandidate && (
                <div className="relative">
                  <div className="absolute top-6 right-6 z-10">
                    <Dialog.Close className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 outline-none cursor-pointer">
                      <XCircle className="w-6 h-6" />
                    </Dialog.Close>
                  </div>

                  <div className="p-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg shadow-sky-100">
                        {selectedCandidate.candidateAvatar && (selectedCandidate.candidateAvatar.startsWith("http") || selectedCandidate.candidateAvatar.startsWith("/") || selectedCandidate.candidateAvatar.includes("upload")) ? (
                          <img src={selectedCandidate.candidateAvatar} alt={selectedCandidate.candidateName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-3xl">
                            {selectedCandidate.candidateName?.substring(0, 1).toUpperCase() || "👨‍💻"}
                          </span>
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedCandidate.candidateName}
                        </Dialog.Title>
                        <div className="flex items-center gap-4">
                          <p className="text-gray-500 font-bold">{selectedCandidate.jobTitle}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[selectedCandidate.status]?.color || "bg-gray-100 text-gray-600"}`}>
                            {statusConfig[selectedCandidate.status]?.label || selectedCandidate.status}
                          </span>
                        </div>
                        {selectedCandidate.cvUrl && (
                          <a 
                            href={getCvFullUrl(selectedCandidate.cvUrl)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-sky-50 text-[#0ea5e9] border border-sky-100 hover:bg-sky-100 hover:text-[#0284c7] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-sky-50"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Mở CV trong tab mới</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tabs điều hướng */}
                    <div className="flex border-b border-gray-100 mb-8">
                      <button
                        onClick={() => setActiveTab("report")}
                        className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                          activeTab === "report"
                            ? "border-[#0ea5e9] text-[#0ea5e9]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        Báo cáo AI & Năng lực
                      </button>
                      <button
                        onClick={() => setActiveTab("cv")}
                        className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                          activeTab === "cv"
                            ? "border-[#0ea5e9] text-[#0ea5e9]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        CV Gốc (PDF)
                      </button>
                    </div>

                    {/* Tab nội dung Báo cáo AI */}
                    {activeTab === "report" && (
                      <>
                        <div className="grid grid-cols-3 gap-6 mb-10">
                          <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl p-6 text-white text-center shadow-xl shadow-sky-100">
                            <div className="text-4xl font-bold mb-1">{selectedCandidate.aiScore}%</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Match Score</div>
                          </div>
                          <div className="bg-green-50 rounded-3xl p-6 text-center border border-green-100">
                            <div className="text-2xl font-bold text-green-700 mb-1">A+</div>
                            <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Kỹ Thuật</div>
                          </div>
                          <div className="bg-sky-50 rounded-3xl p-6 text-center border border-sky-100">
                            <div className="text-2xl font-bold text-sky-700 mb-1">B+</div>
                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Giao Tiếp</div>
                          </div>
                        </div>

                        <div className="mb-10">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#0ea5e9]" />
                            Phân tích năng lực (Radar Chart)
                          </h3>
                          <div className="flex justify-center bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <svg viewBox="0 0 200 200" className="w-64 h-64">
                              <polygon points="100,20 172,65 155,150 45,150 28,65" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                              <polygon points="100,50 145,80 135,130 65,130 55,80" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                              <polygon points="100,30 160,70 145,140 55,140 40,70" fill="#0ea5e9" fillOpacity="0.1" stroke="#0ea5e9" strokeWidth="2" />
                              <circle cx="100" cy="30" r="3" fill="#0ea5e9" />
                              <circle cx="160" cy="70" r="3" fill="#0ea5e9" />
                              <circle cx="145" cy="140" r="3" fill="#0ea5e9" />
                              <circle cx="55" cy="140" r="3" fill="#0ea5e9" />
                              <circle cx="40" cy="70" r="3" fill="#0ea5e9" />
                              <text x="100" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">KỸ THUẬT</text>
                              <text x="185" y="70" textAnchor="start" fontSize="8" fontWeight="bold" fill="#64748b">GIAO TIẾP</text>
                              <text x="160" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">GIẢI QUYẾT VẤN ĐỀ</text>
                              <text x="40" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">LÀM VIỆC NHÓM</text>
                              <text x="15" y="70" textAnchor="end" fontSize="8" fontWeight="bold" fill="#64748b">VĂN HÓA</text>
                            </svg>
                          </div>
                        </div>

                        <div className="mb-10">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#0ea5e9]" />
                            Tóm tắt từ AI
                          </h3>
                          <div className="bg-sky-50 border-l-4 border-[#0ea5e9] p-6 rounded-2xl">
                            <p className="text-gray-700 leading-relaxed font-medium">
                              Ứng viên phù hợp cao với các tiêu chuẩn yêu cầu trong tin tuyển dụng. Điểm ATS đánh giá CV đạt {selectedCandidate.aiScore}/100.
                              <span className="font-bold text-sky-700"> Khuyên dùng: HR thực hiện duyệt và mời tham gia phỏng vấn trực tiếp.</span>
                            </p>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        {selectedCandidate.coverLetter && (
                          <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-sky-600" />
                              Thư xin việc (Cover Letter)
                            </h3>
                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-gray-700 italic text-sm whitespace-pre-wrap">
                              "{selectedCandidate.coverLetter}"
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Tab nội dung CV Gốc (PDF) */}
                    {activeTab === "cv" && (
                      <div className="mb-10">
                        {selectedCandidate.cvUrl ? (
                          <div className="relative">
                             {/* Direct PDF rendering using browser viewer */}
                             <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-50 relative">
                               <iframe
                                 src={getCvFullUrl(selectedCandidate.cvUrl)}
                                 className="w-full h-full border-0"
                                 title={`CV_${selectedCandidate.candidateName}`}
                               />
                             </div>
                             {/* Fallback actions */}
                             <div className="mt-4 flex items-center justify-center gap-4">
                               <a
                                 href={getCvFullUrl(selectedCandidate.cvUrl)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] text-white font-bold text-sm rounded-xl hover:bg-[#0284c7] transition-all shadow-md shadow-sky-100 cursor-pointer"
                                 download={`CV_${selectedCandidate.candidateName}.pdf`}
                               >
                                 <Download className="w-4 h-4" />
                                 <span>Tải CV về máy</span>
                               </a>
                               <a
                                 href={getCvFullUrl(selectedCandidate.cvUrl)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-all cursor-pointer"
                               >
                                 <Eye className="w-4 h-4" />
                                 <span>Mở xem toàn màn hình</span>
                               </a>
                             </div>
                          </div>
                        ) : (
                          <div className="text-center py-20 text-gray-400 font-bold border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            Chưa có file CV được tải lên.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        onClick={() => updateStatusMutation.mutate({ id: selectedCandidate.id, status: "interviewed" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {updateStatusMutation.isPending && updateStatusMutation.variables?.status === "interviewed" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        <span>Mời Phỏng Vấn</span>
                      </button>
                      <button 
                        onClick={() => updateStatusMutation.mutate({ id: selectedCandidate.id, status: "rejected" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {updateStatusMutation.isPending && updateStatusMutation.variables?.status === "rejected" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span>Từ Chối Hồ Sơ</span>
                      </button>
                      {selectedCandidate.status !== "accepted" && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: selectedCandidate.id, status: "accepted" })}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {updateStatusMutation.isPending && updateStatusMutation.variables?.status === "accepted" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                          <span>Đạt / Hợp đồng</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
