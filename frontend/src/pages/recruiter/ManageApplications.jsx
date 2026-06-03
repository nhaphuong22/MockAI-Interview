import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, FileText, Calendar, Eye, ChevronDown, Loader2, RefreshCw, AlertCircle, Sparkles, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { applicationApi } from "../../api/applicationApi";
import { useAuthStore } from "../../store/useAuthStore";
import { chatApi } from "../../api/chatApi";
import { useChatStore } from "../../store/useChatStore";
import { ReviewEmailModal } from "../../components/recruiter/ReviewEmailModal";
import * as Dialog from "@radix-ui/react-dialog";

export function ManageApplications() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentHrId = user?.id;

  // Filter states
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const openChatBox = useChatStore((state) => state.openChatBox);

  // Modal states
  const [modalStatus, setModalStatus] = useState("");
  const [modalHrTag, setModalHrTag] = useState("");
  const [modalHrNotes, setModalHrNotes] = useState("");

  // Review email modal state
  const [reviewModal, setReviewModal] = useState({ isOpen: false, application: null, initialStatus: "HIRED" });

  // 1. Fetch HR's jobs list for dropdown filter
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["hr-jobs", currentHrId],
    queryFn: async () => {
      const response = await jobApi.getJobs({ hr_id: currentHrId, limit: 100 });
      return response;
    },
    enabled: !!currentHrId
  });

  const jobsList = jobsResponse?.data?.items || [];

  // 2. Fetch applications list
  const { data: appsResponse, isLoading: isLoadingApps, isError, refetch } = useQuery({
    queryKey: ["applications", currentHrId, selectedJobId, selectedStatus],
    queryFn: async () => {
      const response = await applicationApi.getApplications({
        job_id: selectedJobId || undefined,
        status: selectedStatus || undefined
      });
      return response;
    },
    enabled: !!currentHrId
  });

  const applicationsList = appsResponse?.data || [];

  // 3. Update application mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status, hr_tag, hr_notes }) => {
      return applicationApi.updateApplication(id, { status, hr_tag, hr_notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      alert("Cập nhật thông tin ứng viên thành công!");
      setSelectedApplication(null);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật thông tin ứng viên:", error);
      alert("Cập nhật thông tin ứng viên thất bại.");
    }
  });

  const handleOpenInspect = (app) => {
    setSelectedApplication(app);
    setModalStatus(app.status || "SUBMITTED");
    setModalHrTag(app.hr_tag || "POTENTIAL");
    setModalHrNotes(app.hr_notes || "");
  };

  const handleChatWithCandidate = async (app) => {
    try {
      const response = await chatApi.getOrCreateConversation({
        receiverId: app.candidate_id,
        applicationId: app.id,
      });
      const conv = response.data;
      if (conv) {
        const otherUser = {
          id: app.candidate_id,
          full_name: app.candidate_name,
          email: app.candidate_email,
          avatar_url: app.candidate_avatar,
          role: "USER"
        };
        openChatBox(conv.id, otherUser, app.id);
      }
    } catch (error) {
      console.error("Lỗi khởi tạo chat với ứng viên:", error);
      alert("Không thể khởi tạo cuộc trò chuyện chat.");
    }
  };

  // Open the Review Email Modal (Phase 5)
  const handleOpenReview = (app, status) => {
    setReviewModal({ isOpen: true, application: app, initialStatus: status });
  };

  const handleSaveInspectChanges = () => {
    if (!selectedApplication) return;
    updateMutation.mutate({
      id: selectedApplication.id,
      status: modalStatus,
      hr_tag: modalHrTag,
      hr_notes: modalHrNotes
    });
  };

  const getScoreBadgeColor = (score) => {
    if (!score) return "bg-gray-100 text-gray-500";
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (score >= 60) return "bg-sky-50 text-sky-700 border border-sky-100";
    return "bg-rose-50 text-rose-700 border border-rose-100";
  };

  const getStatusBadgeStyles = (status) => {
    const statusMap = {
      SUBMITTED: "bg-blue-50 text-blue-700 border border-blue-100",
      AI_INTERVIEW: "bg-amber-50 text-amber-700 border border-amber-100",
      AI_REVIEWED: "bg-purple-50 text-purple-700 border border-purple-100",
      HR_REVIEWING: "bg-indigo-50 text-indigo-700 border border-indigo-100",
      SHORTLISTED: "bg-teal-50 text-teal-700 border border-teal-100",
      INTERVIEW_SCHEDULED: "bg-sky-50 text-sky-700 border border-sky-100",
      HIRED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      REJECTED: "bg-rose-50 text-rose-700 border border-rose-100"
    };
    return statusMap[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusLabel = (status) => {
    const labels = {
      SUBMITTED: "Mới nộp",
      AI_INTERVIEW: "Đang PV AI",
      AI_REVIEWED: "AI Đã duyệt",
      HR_REVIEWING: "HR Đang xét",
      SHORTLISTED: "Tiềm năng (Shortlist)",
      INTERVIEW_SCHEDULED: "Hẹn phỏng vấn",
      HIRED: "Đã tuyển",
      REJECTED: "Không đạt"
    };
    return labels[status] || status;
  };

  const getHrTagStyles = (tag) => {
    const tagMap = {
      POTENTIAL: "bg-green-100 text-green-700",
      SHORTLISTED: "bg-indigo-100 text-indigo-700",
      LATER: "bg-yellow-100 text-yellow-700",
      REJECTED: "bg-red-100 text-red-700"
    };
    return tagMap[tag] || "bg-gray-100 text-gray-600";
  };

  const getHrTagLabel = (tag) => {
    const labels = {
      POTENTIAL: "Tiềm năng",
      SHORTLISTED: "Shortlist",
      LATER: "Xem xét sau",
      REJECTED: "Loại"
    };
    return labels[tag] || "Chưa gắn tag";
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Ứng Tuyển</h1>
            <p className="text-gray-500 text-sm">Theo dõi, đánh giá hồ sơ và gửi email thông báo kết quả đến ứng viên</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tin Tuyển Dụng</label>
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#0ea5e9] focus:outline-none transition-all text-sm font-semibold text-gray-700 appearance-none pr-10"
              >
                <option value="">Tất cả tin tuyển dụng</option>
                {jobsList.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái duyệt</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#0ea5e9] focus:outline-none transition-all text-sm font-semibold text-gray-700 appearance-none pr-10"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="SUBMITTED">Mới nộp</option>
                <option value="AI_INTERVIEW">Đang PV AI</option>
                <option value="AI_REVIEWED">AI Đã duyệt</option>
                <option value="HR_REVIEWING">HR Đang xét</option>
                <option value="SHORTLISTED">Tiềm năng (Shortlist)</option>
                <option value="INTERVIEW_SCHEDULED">Hẹn phỏng vấn</option>
                <option value="HIRED">Đã tuyển</option>
                <option value="REJECTED">Không đạt</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content List */}
        {isLoadingApps ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Đang tải danh sách hồ sơ ứng viên...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-500 font-semibold mb-2">Đã xảy ra lỗi khi tải hồ sơ!</p>
            <button onClick={() => refetch()} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all">
              Tải lại
            </button>
          </div>
        ) : applicationsList.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có ứng viên nào</h3>
            <p className="text-gray-500 text-sm max-w-sm">Chưa có hồ sơ nào nộp cho tin tuyển dụng đang lọc.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ứng Viên</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vị Trí</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Điểm CV</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Điểm PV AI</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Match Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tag HR</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applicationsList.map((app) => (
                    <tr key={app.id} className="hover:bg-sky-50/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white text-base font-bold shadow-sm">
                            {app.candidate_avatar ? (
                              <img src={app.candidate_avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span>{app.candidate_name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors">
                              {app.candidate_name}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {app.candidate_email} • {app.candidate_phone || "Không có SĐT"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <div className="text-sm font-semibold text-gray-700">{app.job_title}</div>
                          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Nộp: {new Date(app.created_at).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreBadgeColor(app.cv_score)}`}>
                          {app.cv_score ? `${app.cv_score}%` : "Chưa chấm"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreBadgeColor(app.interview_score)}`}>
                          {app.interview_score ? `${app.interview_score}%` : "Chưa test"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-12 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] h-2 rounded-full"
                              style={{ width: `${app.total_score || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-gray-800">{app.total_score || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHrTagStyles(app.hr_tag)}`}>
                          {getHrTagLabel(app.hr_tag)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Phase 5: Nút Đạt/Không Đạt + Email */}
                          <button
                            onClick={() => handleOpenReview(app, "HIRED")}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Duyệt Đạt & Gửi Email"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenReview(app, "REJECTED")}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Từ Chối & Gửi Email"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleChatWithCandidate(app)}
                            className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-all"
                            title="Nhắn tin với ứng viên"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenInspect(app)}
                            className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-all"
                            title="Đánh giá chi tiết"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Detailed Application Evaluator Modal */}
        <Dialog.Root open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50 animate-in zoom-in-95 duration-300 outline-none p-8">
              {selectedApplication && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-gray-900">
                        Đánh giá ứng viên: {selectedApplication.candidate_name}
                      </Dialog.Title>
                      <p className="text-gray-500 text-sm mt-1">Ứng tuyển vị trí: {selectedApplication.job_title}</p>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors outline-none"
                    >
                      Đóng
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-black text-emerald-700">{selectedApplication.cv_score ? `${selectedApplication.cv_score}%` : "Chưa chấm"}</div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Điểm CV</div>
                    </div>
                    <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-black text-sky-700">{selectedApplication.interview_score ? `${selectedApplication.interview_score}%` : "Chưa test"}</div>
                      <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mt-1">Điểm PV AI</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl p-4 text-center text-white shadow-md shadow-sky-100">
                      <div className="text-2xl font-black">{selectedApplication.total_score || 0}%</div>
                      <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Độ phù hợp (Match)</div>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  <div className="bg-gradient-to-r from-sky-50/30 to-white border border-sky-100/70 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Nhận xét tổng quan của AI
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      {selectedApplication.ai_summary || "Hệ thống AI đang phân tích dữ liệu, vui lòng đợi kết quả."}
                    </p>
                  </div>

                  {/* CV File Link */}
                  {selectedApplication.cv_file_url && (
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">Tệp hồ sơ đính kèm (CV)</span>
                      </div>
                      <a
                        href={selectedApplication.cv_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#0ea5e9] hover:underline"
                      >
                        Tải xuống CV PDF
                      </a>
                    </div>
                  )}

                  {/* HR Interactive Evaluation Form */}
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-900">Quyết định của Nhà Tuyển Dụng</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">Trạng thái hồ sơ</label>
                        <select
                          value={modalStatus}
                          onChange={(e) => setModalStatus(e.target.value)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#0ea5e9]"
                        >
                          <option value="SUBMITTED">Mới nộp</option>
                          <option value="AI_INTERVIEW">Đang PV AI</option>
                          <option value="AI_REVIEWED">AI Đã duyệt</option>
                          <option value="HR_REVIEWING">HR Đang xét</option>
                          <option value="SHORTLISTED">Tiềm năng (Shortlist)</option>
                          <option value="INTERVIEW_SCHEDULED">Hẹn phỏng vấn</option>
                          <option value="HIRED">Đã tuyển</option>
                          <option value="REJECTED">Không đạt</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">Nhãn phân loại (Tag)</label>
                        <select
                          value={modalHrTag}
                          onChange={(e) => setModalHrTag(e.target.value)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#0ea5e9]"
                        >
                          <option value="POTENTIAL">Tiềm năng</option>
                          <option value="SHORTLISTED">Shortlist</option>
                          <option value="LATER">Xem xét sau</option>
                          <option value="REJECTED">Loại</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">Ghi chú nội bộ của HR</label>
                      <textarea
                        rows="3"
                        value={modalHrNotes}
                        onChange={(e) => setModalHrNotes(e.target.value)}
                        placeholder="VD: Kỹ năng giao tiếp xuất sắc, cần sắp xếp lịch hẹn phỏng vấn sâu hơn với Tech Lead..."
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      onClick={handleSaveInspectChanges}
                      disabled={updateMutation.isPending}
                      className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-100 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? "Đang lưu..." : "Lưu Đánh Giá"}
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Phase 5: Review Email Modal */}
        <ReviewEmailModal
          application={reviewModal.application}
          initialStatus={reviewModal.initialStatus}
          isOpen={reviewModal.isOpen}
          onOpenChange={(open) => setReviewModal((prev) => ({ ...prev, isOpen: open }))}
          onSuccess={() => {
            queryClient.invalidateQueries(["applications"]);
          }}
        />

      </div>
    </div>
  );
}
export default ManageApplications;
