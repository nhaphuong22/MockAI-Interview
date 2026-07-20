import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldOff, AlertTriangle, ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

// Reasons mapping Vietnamese
const REASON_LABELS = {
  "Spam": "Nội dung spam / quảng cáo không phù hợp",
  "Thông tin sai lệch": "Thông tin sai lệch, gây hiểu nhầm",
  "Ngôn ngữ thù địch": "Ngôn ngữ thù địch, phân biệt đối xử",
  "Nội dung người lớn": "Nội dung người lớn / không phù hợp",
  "Vi phạm bản quyền": "Vi phạm bản quyền hoặc sở hữu trí tuệ",
  "Lừa đảo": "Nội dung lừa đảo, gian lận",
  "Khác": "Vi phạm Tiêu chuẩn cộng đồng",
};

const POLICY_RULES = [
  "Không đăng nội dung spam hoặc quảng cáo không liên quan.",
  "Không chia sẻ thông tin sai lệch, gây hoang mang dư luận.",
  "Không sử dụng ngôn từ thù địch, phân biệt đối xử dưới mọi hình thức.",
  "Không đăng nội dung người lớn hoặc bạo lực.",
  "Tôn trọng quyền sở hữu trí tuệ và bản quyền của người khác.",
];

export function ContentHiddenPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const title = params.get("title") || "Nội dung của bạn";
  const type = params.get("type") || "COMMUNITY_POST";
  const reason = params.get("reason") || "Khác";

  const reasonLabel = REASON_LABELS[reason] || REASON_LABELS["Khác"];
  const typeLabel = type === "JOB" ? "tin tuyển dụng" : "bài viết";
  const backPath = type === "JOB" ? "/jobs" : "/community";
  const backLabel = type === "JOB" ? "Trang Việc Làm" : "Trang Cộng Đồng";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0f1c] dark:to-[#0f172a] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* Icon header */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center rotate-6">
              <ShieldOff className="w-12 h-12 text-rose-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
          {/* Red top bar */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 to-orange-400" />

          <div className="p-8 md:p-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
              Nội dung đã bị ẩn
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
              Quản trị viên đã ẩn {typeLabel} này khỏi nền tảng sau khi xem xét các báo cáo từ cộng đồng.
            </p>

            {/* Content info */}
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Nội dung bị ẩn</p>
              <p className="font-bold text-slate-800 dark:text-white text-lg leading-snug">
                &ldquo;{title}&rdquo;
              </p>
            </div>

            {/* Reason */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Lý do vi phạm</p>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold">{reasonLabel}</p>
              </div>
            </div>

            {/* Community guidelines */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tiêu chuẩn cộng đồng MockAI
              </p>
              <ul className="space-y-2">
                {POLICY_RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* What to do next */}
            <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/20 rounded-2xl p-4 mb-8">
              <MessageSquare className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-sky-700 dark:text-sky-300">
                Nếu bạn cho rằng đây là quyết định nhầm, hãy liên hệ với đội ngũ hỗ trợ của MockAI qua email{" "}
                <a href="mailto:support@mockai.vn" className="font-bold underline">support@mockai.vn</a>{" "}
                để được xem xét lại.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              <button
                onClick={() => navigate(backPath)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/20"
              >
                Đến {backLabel}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          MockAI • Bảo vệ cộng đồng lành mạnh
        </p>
      </motion.div>
    </div>
  );
}

export default ContentHiddenPage;
