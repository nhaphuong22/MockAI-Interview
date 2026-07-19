import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, AlertCircle } from "lucide-react";
import { jobApi } from "../../../api/jobApi";

export function CandidateDeclineModal({ isOpen, onClose, applicationId, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  const REASONS = [
    { id: "ALREADY_HIRED", label: "Tôi đã tìm được việc khác" },
    { id: "NOT_INTERESTED", label: "Tôi không còn hứng thú với vị trí này" },
    { id: "SCHEDULE_CONFLICT", label: "Tôi không có thời gian tham gia phỏng vấn" },
    { id: "OTHER", label: "Lý do khác" }
  ];

  const handleSubmit = async () => {
    if (!reason) {
      setError("Vui lòng chọn một lý do.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await jobApi.declineAIInterview(applicationId, {
        decline_reason: reason,
        decline_note: note
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi từ chối phỏng vấn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-xl w-full max-w-md z-50 animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
              Từ chối phỏng vấn AI
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 p-4 rounded-xl text-sm font-medium flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Bạn chắc chắn muốn từ chối lời mời này? 10 Credits sẽ được hoàn trả cho Nhà tuyển dụng và hồ sơ của bạn sẽ kết thúc quá trình tuyển dụng tại đây.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Lý do từ chối <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="radio" 
                      name="decline_reason" 
                      value={r.id}
                      checked={reason === r.id}
                      onChange={() => setReason(r.id)}
                      className="text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Ghi chú thêm (Không bắt buộc)</label>
              <textarea 
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
                placeholder="Nhập thêm chia sẻ của bạn..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận từ chối"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
