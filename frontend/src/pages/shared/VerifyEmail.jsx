import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { verifyEmailApi, resendVerificationApi } from "../../api/auth";

const verifiedTokens = new Set();

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(""); // "" | "sending" | "sent" | "error"

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Liên kết xác thực không hợp lệ. Vui lòng kiểm tra lại email của bạn.");
      return;
    }

    if (verifiedTokens.has(token)) return;
    verifiedTokens.add(token);

    const verify = async () => {
      try {
        const res = await verifyEmailApi(token, email);
        if (res.success) {
          setStatus("success");
          setMessage("Email của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.");
        } else {
          setStatus("error");
          setMessage(res.error || "Xác thực thất bại. Liên kết có thể đã hết hạn.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendStatus("sending");
    try {
      await resendVerificationApi(resendEmail);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-sky-100/50 border border-gray-50 p-10 text-center">

          {/* Loading */}
          {status === "loading" && (
            <div className="animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xác thực...</h1>
              <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Xác thực thành công! 🎉</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-sky-200 transition-all active:scale-[0.98] shadow-md shadow-sky-100"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Xác thực thất bại</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>

              {/* Resend form */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-left mb-6">
                <p className="text-sm font-bold text-sky-800 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Gửi lại email xác thực
                </p>
                {resendStatus === "sent" ? (
                  <p className="text-sm text-emerald-600 font-semibold">
                    ✅ Đã gửi! Vui lòng kiểm tra hộp thư của bạn.
                  </p>
                ) : (
                  <form onSubmit={handleResend} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Email của bạn"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 text-sm border-2 border-sky-100 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={resendStatus === "sending"}
                      className="px-4 py-2 bg-[#0ea5e9] text-white text-sm font-bold rounded-xl hover:bg-[#0284c7] transition-all disabled:opacity-60"
                    >
                      {resendStatus === "sending" ? "..." : "Gửi"}
                    </button>
                  </form>
                )}
                {resendStatus === "error" && (
                  <p className="text-xs text-red-500 mt-2">Không thể gửi. Vui lòng thử lại.</p>
                )}
              </div>

              <button
                onClick={() => navigate("/")}
                className="text-sm text-[#0ea5e9] font-semibold hover:underline"
              >
                Quay về trang chủ
              </button>
            </div>
          )}
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 MockAI Interview Platform
        </p>
      </div>
    </div>
  );
}
