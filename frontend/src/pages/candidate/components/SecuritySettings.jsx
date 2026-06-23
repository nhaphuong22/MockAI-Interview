import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { changePasswordApi } from "../../../api/auth";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password strength calculator
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: "Yếu", color: "bg-red-400" };
    if (score <= 2) return { score, label: "Trung bình", color: "bg-yellow-400" };
    if (score <= 3) return { score, label: "Khá mạnh", color: "bg-sky-400" };
    return { score, label: "Mạnh", color: "bg-emerald-500" };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePasswordApi(currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại nếu được yêu cầu." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: res.error || "Có lỗi xảy ra. Vui lòng thử lại." });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mật khẩu & Bảo mật</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>

      {/* Status message */}
      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 font-semibold text-sm ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}>
          {message.type === "success"
            ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          }
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl focus:bg-white dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 dark:border-white/10 [&::-ms-reveal]:hidden"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-white/10" />

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl focus:bg-white dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 dark:border-white/10 [&::-ms-reveal]:hidden"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Strength indicator */}
          {newPassword && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-gray-100"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Độ mạnh mật khẩu:{" "}
                <span className={`font-bold ${
                  strength.score <= 1 ? "text-red-500" :
                  strength.score <= 2 ? "text-yellow-500" :
                  strength.score <= 3 ? "text-sky-500" : "text-emerald-500"
                }`}>
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl focus:bg-white dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 dark:border-white/10 [&::-ms-reveal]:hidden"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">⚠ Mật khẩu không khớp.</p>
          )}
          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-xs text-emerald-500 mt-1.5 font-medium">✓ Mật khẩu khớp nhau.</p>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-sky-700 mb-2">💡 Gợi ý tạo mật khẩu mạnh:</p>
          <ul className="text-xs text-sky-600 space-y-1 list-disc list-inside">
            <li>Ít nhất 10 ký tự</li>
            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
            <li>Không dùng thông tin cá nhân như ngày sinh, tên</li>
            <li>Không dùng lại mật khẩu từ trang khác</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-5 h-5" />
            {isSubmitting ? "Đang cập nhật..." : "Đổi Mật Khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}
