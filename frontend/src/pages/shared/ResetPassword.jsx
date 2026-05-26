import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { resetPasswordApi } from "../../api/auth";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("form"); // "form" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.length < 6) {
      setErrorMsg("Mã xác nhận (OTP) không hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(otp, password);
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(res.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.error || "Liên kết không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
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

  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-sky-100/50 border border-gray-50 p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-2xl mb-4">
              <KeyRound className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {status === "success" ? "Đặt lại thành công!" : status === "error" ? "Liên kết không hợp lệ" : "Đặt lại mật khẩu"}
            </h1>
            <p className="text-sm text-gray-500">
              {status === "form" ? "Nhập mật khẩu mới của bạn bên dưới" : ""}
            </p>
          </div>

          {/* Success */}
          {status === "success" && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Mật khẩu của bạn đã được cập nhật thành công. Hãy đăng nhập bằng mật khẩu mới.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-sky-200 transition-all shadow-md shadow-sky-100"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{errorMsg}</p>
              <p className="text-xs text-gray-400 mb-6">
                Liên kết đặt lại mật khẩu chỉ có hiệu lực trong 1 giờ. Hãy yêu cầu gửi lại từ trang Quên mật khẩu.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold rounded-2xl hover:bg-sky-50 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {/* Form */}
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}

              {/* OTP Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mã xác nhận (OTP)</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập mã 6 chữ số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 tracking-widest text-center text-lg"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 [&::-ms-reveal]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-gray-100"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Độ mạnh: <span className="font-semibold">{strength.label}</span></p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100 [&::-ms-reveal]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">Mật khẩu không khớp.</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-emerald-500 mt-1.5 font-medium">✓ Mật khẩu khớp nhau.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-sky-200 transition-all active:scale-[0.98] disabled:opacity-60 shadow-md shadow-sky-100 mt-2"
              >
                {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 MockAI Interview Platform
        </p>
      </div>
    </div>
  );
}
