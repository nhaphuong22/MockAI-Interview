import { Bookmark, Bot, Zap, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { jobApi } from "../../../api/jobApi";
import { useAuthStore } from "../../../store/useAuthStore";

/**
 * JobDetailView Component
 * Renders detailed description and metadata of a selected job listing
 */
export function JobDetailView({ job, onToggleBookmark, isBookmarked }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const applyMutation = useMutation({
    mutationFn: () => jobApi.applyForJob(job.id),
    onSuccess: (data) => {
      // After apply success -> navigate to AI interview
      const interviewJobId = job.id;
      setShowConfirm(false);
      navigate(`/interview-ai/${interviewJobId}`, {
        state: { jobTitle: job.title, jobCompany: job.company, applicationId: data?.data?.id }
      });
    },
    onError: (err) => {
      setShowConfirm(false);
      const msg = err?.response?.data?.message || "Đã xảy ra lỗi khi nộp đơn. Vui lòng thử lại.";
      setToast({ type: "error", message: msg });
      setTimeout(() => setToast(null), 4000);
    }
  });

  const handleApply = () => {
    if (!user) {
      setToast({ type: "warning", message: "Yêu cầu đăng nhập để dùng được tính năng này" });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setShowConfirm(true);
  };

  return (
    <>
    {/* Toast */}
    {toast && (
      <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-md ${
        toast.type === "error" ? "bg-rose-50/95 border-rose-200 text-rose-800"
        : toast.type === "warning" ? "bg-amber-50/95 border-amber-200 text-amber-800"
        : "bg-emerald-50/95 border-emerald-200 text-emerald-800"
      }`}>
        <AlertCircle className="w-5 h-5" />
        <p className="font-bold text-sm">{toast.message}</p>
      </div>
    )}

    {/* Apply Confirm Modal */}
    {showConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
        <div className="relative bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full">
          <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-1">Ứng tuyển & Phỏng vấn AI</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sau khi ứng tuyển, bạn sẽ được dẫn vào buổi phỏng vấn AI ngay lập tức.
                Kết quả sẽ được gửi cho HR để xem xét.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 text-xs text-left">
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <Zap className="w-4 h-4 text-violet-500 shrink-0" />
                <span>AI sẽ hỏi <strong>5–8 câu hỏi</strong> phù hợp với vị trí <strong>{job.title}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kết quả được chấm điểm tự động và gửi về cho <strong>HR</strong></span>
              </div>
            </div>
            <div className="w-full flex gap-3 mt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-100 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {applyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                Xác nhận & Bắt đầu PV
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="w-1/2 border-l dark:border-white/10 border-gray-200 dark:bg-[#0a0f1c]/80 bg-white overflow-y-auto h-full flex flex-col">
      {/* Sticky top actions bar */}
      <div className="sticky top-0 dark:bg-[#0a0f1c]/95 bg-white/95 backdrop-blur-md border-b dark:border-white/10 border-gray-200 p-6 z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-3xl shrink-0 text-white">
            {job.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-1 truncate">{job.title}</h2>
            <p className="text-lg dark:text-slate-300 text-gray-600 font-medium">{job.company}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Ứng tuyển & Phỏng vấn AI
          </button>
          <button 
            onClick={() => onToggleBookmark(job.id)}
            className="px-4 py-3 border-2 dark:border-white/10 border-gray-200 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 hover:bg-[#f0f9ff] dark:text-slate-400 text-gray-400 hover:text-[#0ea5e9] transition-all"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#0ea5e9] text-[#0ea5e9]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main details body */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Thông Tin Chung</h3>
          <div className="grid grid-cols-2 gap-4 dark:bg-slate-800/50 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-100">
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Mức lương</p>
              <p className="font-bold text-[#0ea5e9]">{job.salary}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Kinh nghiệm</p>
              <p className="font-bold dark:text-white text-gray-800">{job.experience}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Hình thức</p>
              <p className="font-bold dark:text-white text-gray-800">{job.type}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Địa điểm</p>
              <p className="font-bold dark:text-white text-gray-800">{job.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Mô Tả Công Việc</h3>
          <div className="dark:text-slate-300 text-gray-700 text-sm leading-relaxed space-y-3 whitespace-pre-line">
            {job.description ? (
              <p>{job.description}</p>
            ) : (
              <>
                <p>
                  Chúng tôi đang tìm kiếm một {job.title} để gia nhập đội ngũ phát triển
                  sản phẩm. Bạn sẽ làm việc với các công nghệ hiện đại và tham gia vào các dự án
                  thú vị của chúng tôi.
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Phát triển và duy trì các tính năng mới trên các sản phẩm cốt lõi.</li>
                  <li>Làm việc chặt chẽ với team thiết kế và backend để đảm bảo chất lượng.</li>
                  <li>Tham gia code review và liên tục cập nhật/áp dụng các tiêu chuẩn chất lượng.</li>
                </ul>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Yêu Cầu Công Việc</h3>
          {job.requirements ? (
            <div className="dark:text-slate-300 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-1.5 dark:text-slate-300 text-gray-700 text-sm ml-2">
              <li>Kinh nghiệm làm việc từ {job.experience}.</li>
              <li>Thành thạo các công nghệ chính: {job.tags?.join(", ") || ""}.</li>
              <li>Kỹ năng giao tiếp tốt, tư duy phản biện.</li>
              <li>Tinh thần trách nhiệm và khả năng phối hợp đội nhóm tốt.</li>
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Phúc Lợi</h3>
          <ul className="list-disc list-inside space-y-1.5 dark:text-slate-300 text-gray-700 text-sm ml-2">
            <li>Lương thưởng cạnh tranh dựa trên năng lực cá nhân.</li>
            <li>Đóng bảo hiểm đầy đủ (BHXH, BHYT) theo quy định của nhà nước.</li>
            <li>Chính sách làm việc linh hoạt, có hỗ trợ thiết bị.</li>
            <li>Môi trường năng động, chuyên nghiệp và có cơ hội thăng tiến cao.</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
