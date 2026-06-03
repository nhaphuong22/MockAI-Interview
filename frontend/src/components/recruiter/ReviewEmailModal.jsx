import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Mail, Loader2, ChevronDown } from "lucide-react";
import { applicationApi } from "../../api/applicationApi";
import * as Dialog from "@radix-ui/react-dialog";

// Email preview templates
const QUICK_MESSAGES = {
  HIRED: [
    "Chúng tôi ấn tượng với hồ sơ và kết quả phỏng vấn của bạn. Đội tuyển dụng sẽ liên hệ để sắp xếp các bước onboarding sớm nhất.",
    "Hồ sơ của bạn nổi bật hơn hẳn so với các ứng viên khác. Chúc mừng và hẹn gặp bạn trong team!",
    "Chúng tôi tin rằng bạn sẽ là một thành viên xuất sắc. Vui lòng chuẩn bị giấy tờ cần thiết và chờ liên hệ từ HR.",
  ],
  REJECTED: [
    "Hồ sơ của bạn có nhiều điểm tiềm năng, tuy nhiên vị trí này cần kinh nghiệm chuyên sâu hơn ở một số kỹ năng cụ thể. Chúng tôi sẽ lưu thông tin của bạn cho các cơ hội phù hợp trong tương lai.",
    "Vì số lượng ứng viên rất đông và có nhiều ứng viên xuất sắc, chúng tôi rất tiếc không thể tiến hành vòng tiếp theo. Hãy tiếp tục theo dõi các vị trí khác của chúng tôi nhé!",
    "Trình độ của bạn chưa hoàn toàn phù hợp với yêu cầu hiện tại, nhưng chúng tôi khuyến khích bạn tiếp tục phát triển và ứng tuyển lại trong tương lai.",
  ],
};

/**
 * Modal xác nhận duyệt ứng viên (Đạt/Không Đạt) và gửi email tự động
 */
export function ReviewEmailModal({ application, initialStatus = "HIRED", isOpen, onOpenChange, onSuccess }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(initialStatus);
  const [customMessage, setCustomMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const isHired = status === "HIRED";

  const handleQuickMessage = (msg) => {
    setCustomMessage(msg);
  };

  const reviewMutation = useMutation({
    mutationFn: () =>
      applicationApi.reviewApplication(application.id, {
        status,
        customMessage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Lỗi khi duyệt ứng viên:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.");
    },
  });

  const handleSubmit = () => {
    reviewMutation.mutate();
  };

  if (!application) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50 outline-none animate-in zoom-in-95 duration-200"
          aria-describedby="review-modal-description"
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Duyệt Kết Quả Ứng Viên
                </Dialog.Title>
                <p id="review-modal-description" className="text-sm text-gray-500 mt-1">
                  Hệ thống sẽ tự động gửi email thông báo đến ứng viên sau khi bạn xác nhận.
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors outline-none ml-4 shrink-0"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Info Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                {application.candidate_avatar ? (
                  <img src={application.candidate_avatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{application.candidate_name?.charAt(0) || "U"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{application.candidate_name}</p>
                <p className="text-xs text-gray-500 truncate">{application.candidate_email}</p>
                <p className="text-xs text-[#0ea5e9] font-semibold mt-0.5 truncate">📌 {application.job_title}</p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Quyết định của bạn:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setStatus("HIRED"); setCustomMessage(""); }}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    isHired
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                      : "border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 ${isHired ? "text-emerald-500" : "text-gray-400"}`} />
                  ✅ Đạt (Tuyển)
                </button>
                <button
                  onClick={() => { setStatus("REJECTED"); setCustomMessage(""); }}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    !isHired
                      ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100"
                      : "border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50/50"
                  }`}
                >
                  <XCircle className={`w-5 h-5 ${!isHired ? "text-rose-500" : "text-gray-400"}`} />
                  ❌ Không Đạt
                </button>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0ea5e9]" />
                Lời nhắn email đến ứng viên (tùy chọn):
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_MESSAGES[status].map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickMessage(msg)}
                    className="text-[11px] px-3 py-1.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors font-medium"
                  >
                    Mẫu {i + 1}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={`VD: ${isHired ? "Chúng tôi rất vui được chào đón bạn vào team..." : "Cảm ơn bạn đã ứng tuyển, chúc bạn tìm được việc phù hợp..."}`}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all resize-none"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Để trống nếu muốn dùng nội dung email mặc định của hệ thống.
              </p>
            </div>

            {/* Email Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors mb-5"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Xem trước email sẽ gửi
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? "rotate-180" : ""}`} />
            </button>

            {/* Email Preview Panel */}
            {showPreview && (
              <div className={`rounded-2xl border p-4 mb-5 text-sm ${isHired ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}>
                <p className="font-bold text-gray-800 mb-1">📧 Tiêu đề email:</p>
                <p className="text-gray-600 italic text-xs mb-3">
                  {isHired
                    ? `🎉 [MockAI] Chúc mừng! Bạn đã vượt qua vòng xét duyệt hồ sơ cho vị trí "${application.job_title}"`
                    : `[MockAI] Thông báo kết quả xét duyệt hồ sơ vị trí "${application.job_title}"`
                  }
                </p>
                <p className="font-bold text-gray-800 mb-1">📝 Nội dung chính:</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {isHired
                    ? `Xin chào ${application.candidate_name}, hồ sơ của bạn cho vị trí "${application.job_title}" đã được CHẤP THUẬN.`
                    : `Xin chào ${application.candidate_name}, rất tiếc hồ sơ của bạn cho vị trí "${application.job_title}" chưa phù hợp với yêu cầu hiện tại.`
                  }
                  {customMessage && ` — ${customMessage.slice(0, 80)}${customMessage.length > 80 ? "..." : ""}`}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                disabled={reviewMutation.isPending}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={reviewMutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg disabled:opacity-50 ${
                  isHired
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 shadow-emerald-100"
                    : "bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 shadow-rose-100"
                }`}
              >
                {reviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {isHired ? "Duyệt Đạt & Gửi Email" : "Từ Chối & Gửi Email"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ReviewEmailModal;
