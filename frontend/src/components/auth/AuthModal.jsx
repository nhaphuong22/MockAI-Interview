import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, Lock, Eye, EyeOff, Briefcase, User, Building, Check, ArrowLeft, SendHorizonal, ShieldCheck } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Progress from "@radix-ui/react-progress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, loginGoogleApi, forgotPasswordApi, resendVerificationApi, verifyEmailApi } from "../../api/auth";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * AuthModal — handles: login | register | forgot-password | register-success
 */
export function AuthModal({ isOpen, onOpenChange, initialMode = "login", onLoginSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // "login" | "register" | "forgot-password" | "register-success"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regStep, setRegStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(null); // "jobseeker" | "recruiter"

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");

  // OTP Verification State
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // Reset form when modal opens/mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // ─── Google Sign-In ──────────────────────────────────────────────────────────

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await loginGoogleApi(response.credential);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        useAuthStore.getState().setAuth(user);
        onOpenChange(false);
        if (onLoginSuccess) onLoginSuccess();
        const role = user.role ? user.role.toUpperCase() : "USER";
        navigate(role === "ADMIN" ? "/admin/dashboard" : role === "HR" ? "/hr/dashboard" : "/");
      } else {
        setErrorMsg(res.error || "Đăng nhập Google thất bại.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Không thể đăng nhập bằng Google.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let checkInterval;
    const initializeGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "67427310564-h2j7k0dauv68et015nfc5r2kgt5vgfpo.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: btnContainer.clientWidth || 320,
            text: "signin_with",
            shape: "rectangular",
          });
        }
        clearInterval(checkInterval);
      }
    };
    initializeGoogleBtn();
    checkInterval = setInterval(initializeGoogleBtn, 300);
    return () => clearInterval(checkInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, regStep]);

  // ─── Login ───────────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await loginApi(loginEmail, loginPassword);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        useAuthStore.getState().setAuth(user);
        onOpenChange(false);
        if (onLoginSuccess) onLoginSuccess();
        const userRole = user.role ? user.role.toUpperCase() : "USER";
        navigate(userRole === "ADMIN" ? "/admin/dashboard" : userRole === "HR" ? "/hr/dashboard" : "/");
      } else {
        setErrorMsg(res.error || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || "";
      if (errMsg.toLowerCase().includes("not verified") || errMsg.toLowerCase().includes("email not verified")) {
        setErrorMsg("Email chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực tài khoản.");
      } else {
        setErrorMsg("Sai email hoặc mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ────────────────────────────────────────────────────────────────

  const handleRegisterNext = (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (regPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setRegStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await registerApi({ email: regEmail, password: regPassword, fullName, role });
      if (res.success) {
        setOtpEmail(regEmail);
        setMode("verify-otp");
        setRegStep(1);
        setFullName(""); setRegEmail(""); setRegPassword(""); setConfirmPassword(""); setRole(null);
      } else {
        setErrorMsg(res.error || "Đăng ký thất bại.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Email đã tồn tại hoặc dữ liệu không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password ──────────────────────────────────────────────────────────

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await forgotPasswordApi(forgotEmail);
      if (res.success) {
        setSuccessMsg("Nếu email này tồn tại, chúng tôi đã gửi mã OTP đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
        setForgotEmail("");
        setTimeout(() => {
          onOpenChange(false);
          navigate('/reset-password');
        }, 1500);
      } else {
        setErrorMsg(res.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend Verification ──────────────────────────────────────────────────────

  const handleResendVerification = async () => {
    if (!loginEmail) {
      setErrorMsg("Vui lòng nhập email của bạn trước.");
      return;
    }
    setLoading(true);
    try {
      await resendVerificationApi(loginEmail);
      setErrorMsg("");
      setOtpEmail(loginEmail);
      setMode("verify-otp");
      setOtpSuccess("Mã OTP đã được gửi lại. Vui lòng kiểm tra hộp thư!");
    } catch {
      setErrorMsg("Không thể gửi lại email. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Verification ─────────────────────────────────────────────────────────

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (otp.length !== 6) {
      setOtpError("Mã OTP phải có đúng 6 chữ số.");
      return;
    }
    setLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const res = await verifyEmailApi(otp, otpEmail);
      if (res.success) {
        setOtpSuccess("Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setTimeout(() => {
          setOtp("");
          setOtpSuccess("");
          switchMode("login");
        }, 2000);
      } else {
        setOtpError(res.error || "Mã OTP không chính xác hoặc đã hết hạn.");
      }
    } catch (error) {
      setOtpError(error.response?.data?.error || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      await resendVerificationApi(otpEmail);
      setOtpSuccess("Mã OTP mới đã được gửi đến email của bạn.");
    } catch {
      setOtpError("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpArr = otp.split("");
    // If user pastes a full string, handle it
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      setOtp(pasted);
      if (pasted.length === 6) {
        document.getElementById(`otp-5`)?.focus();
      } else {
        document.getElementById(`otp-${pasted.length}`)?.focus();
      }
      return;
    }
    
    newOtpArr[index] = value;
    const combined = newOtpArr.join("");
    setOtp(combined);
    
    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        // optionally clear the previous input too
        const newOtpArr = otp.split("");
        newOtpArr[index - 1] = "";
        setOtp(newOtpArr.join(""));
      }
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const isEmailNotVerifiedError = errorMsg.toLowerCase().includes("chưa được xác thực");

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[420px] bg-white rounded-2xl shadow-xl z-50 p-6 sm:p-8 animate-in zoom-in-95 duration-200 focus:outline-none">
          <Dialog.Title className="sr-only">
            {mode === "login" ? "Đăng nhập" : mode === "register" ? "Đăng ký" : mode === "forgot-password" ? "Quên mật khẩu" : "Xác thực email"}
          </Dialog.Title>
          <Dialog.Description className="sr-only">Xác thực tài khoản MockAI</Dialog.Description>

          <Dialog.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Dialog.Close>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-sky-100 text-sky-600 p-3 rounded-full mb-4 shadow-sm shadow-sky-100">
              {mode === "forgot-password" ? <Lock className="w-8 h-8" /> : mode === "register-success" ? <ShieldCheck className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Chào mừng trở lại!" : mode === "register" ? "Tạo tài khoản mới" : mode === "forgot-password" ? "Quên mật khẩu?" : "Kiểm tra Email!"}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === "login" ? "Đăng nhập để tiếp tục hành trình của bạn"
                : mode === "register" ? "Bắt đầu hành trình sự nghiệp cùng AI"
                : mode === "forgot-password" ? "Nhập email để nhận link đặt lại mật khẩu"
                : "Chúng tôi đã gửi email xác thực đến hộp thư của bạn"}
            </p>
          </div>

          {/* Error / Success Messages */}
          {errorMsg && (
            <div className="text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100 mb-4 animate-in fade-in duration-200">
              <p>{errorMsg}</p>
              {isEmailNotVerifiedError && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="mt-2 text-[#0ea5e9] underline font-bold text-xs"
                >
                  Gửi lại email xác thực
                </button>
              )}
            </div>
          )}
          {successMsg && (
            <div className="text-emerald-600 text-xs font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-4 animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-4 h-4 border-2 border-gray-200 rounded flex items-center justify-center bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-all"
                    id="remember"
                  >
                    <Checkbox.Indicator><Check className="w-3 h-3 text-white" /></Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor="remember" className="text-[13px] text-gray-600 cursor-pointer select-none font-medium">Ghi nhớ tôi</label>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode("forgot-password")}
                  className="text-[13px] font-bold text-[#0ea5e9] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-sky-100 mt-2"
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150"></div></div>
                <span className="relative bg-white px-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Hoặc</span>
              </div>

              <div className="w-full flex justify-center mb-4">
                <div id="google-signin-btn" className="w-full min-h-[40px] flex justify-center"></div>
              </div>

              <div className="text-center mt-4 text-[13px] text-gray-500 font-medium">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={() => switchMode("register")} className="text-[#0ea5e9] font-bold hover:underline ml-1">
                  Đăng ký miễn phí
                </button>
              </div>
            </form>
          )}

          {/* ── REGISTER ── */}
          {mode === "register" && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Bước {regStep} / 2</span>
                  <span className="text-xs font-bold text-[#0ea5e9]">{regStep === 1 ? "Thông tin cá nhân" : "Xác nhận vai trò"}</span>
                </div>
                <Progress.Root className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <Progress.Indicator
                    className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500"
                    style={{ width: `${regStep * 50}%` }}
                  />
                </Progress.Root>
              </div>

              {regStep === 1 ? (
                <form onSubmit={handleRegisterNext} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off" required className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} autoComplete="off" required className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showRegPassword ? "text" : "password"} placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" required className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all [&::-ms-reveal]:hidden" />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Xác nhận</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all [&::-ms-reveal]:hidden" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all mt-6 shadow-md shadow-sky-100 active:scale-[0.98]">
                    Tiếp tục
                  </button>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150"></div></div>
                    <span className="relative bg-white px-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Hoặc</span>
                  </div>
                  <div className="w-full flex justify-center">
                    <div id="google-signin-btn" className="w-full min-h-[40px] flex justify-center"></div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <p className="text-center text-[13px] font-medium mb-3 text-gray-700">Chọn vai trò của bạn</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button type="button" onClick={() => setRole("jobseeker")} className={`p-4 border-2 rounded-xl transition-all ${role === "jobseeker" ? "border-[#0ea5e9] bg-sky-50 shadow-sm" : "border-gray-100 hover:border-sky-200"}`}>
                      <User className={`w-8 h-8 mx-auto mb-2 ${role === "jobseeker" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                      <div className={`text-[13px] font-bold ${role === "jobseeker" ? "text-sky-900" : "text-gray-700"}`}>Ứng viên</div>
                    </button>
                    <button type="button" onClick={() => setRole("recruiter")} className={`p-4 border-2 rounded-xl transition-all ${role === "recruiter" ? "border-[#0ea5e9] bg-sky-50 shadow-sm" : "border-gray-100 hover:border-sky-200"}`}>
                      <Building className={`w-8 h-8 mx-auto mb-2 ${role === "recruiter" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                      <div className={`text-[13px] font-bold ${role === "recruiter" ? "text-sky-900" : "text-gray-700"}`}>Nhà Tuyển Dụng</div>
                    </button>
                  </div>

                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Checkbox.Root className="w-4 h-4 mt-0.5 shrink-0 border-2 border-gray-300 rounded flex items-center justify-center bg-white data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9]" id="terms" required>
                      <Checkbox.Indicator><Check className="w-3 h-3 text-white" /></Checkbox.Indicator>
                    </Checkbox.Root>
                    <label htmlFor="terms" className="text-[11px] text-gray-600 leading-tight">
                      Tôi đồng ý với <span className="text-[#0ea5e9] font-bold hover:underline cursor-pointer">Điều khoản</span> và <span className="text-[#0ea5e9] font-bold hover:underline cursor-pointer">Chính sách Bảo mật</span> của MockAI.
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRegStep(1)} className="w-1/3 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-[13px]">
                      Quay lại
                    </button>
                    <button type="submit" disabled={!role || loading} className="w-2/3 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all disabled:opacity-50 text-[13px] shadow-md shadow-sky-100">
                      {loading ? "Đang xử lý..." : "Hoàn Tất"}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-6 text-[13px] text-gray-500 font-medium">
                Đã có tài khoản?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-[#0ea5e9] font-bold hover:underline ml-1">
                  Đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* ── VERIFY OTP ── */}
          {mode === "verify-otp" && (
            <div className="animate-in fade-in duration-300">
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-sm text-gray-500">
                    Mã xác thực đã được gửi đến email: <br />
                    <strong className="text-gray-700">{otpEmail}</strong>
                  </p>
                </div>

                {otpError && (
                  <div className="text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                    {otpError}
                  </div>
                )}
                {otpSuccess && (
                  <div className="text-emerald-600 text-xs font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    {otpSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-3 text-center text-gray-700">
                    Mã OTP (6 chữ số)
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={6} // Allow pasting
                        value={otp[index] || ""}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center font-extrabold text-2xl border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all"
                        required={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-sky-100"
                >
                  {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                </button>

                <div className="text-center text-[13px] text-gray-500 font-medium">
                  Không nhận được mã?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#0ea5e9] font-bold hover:underline"
                  >
                    Gửi lại mã
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtp("");
                    setOtpError("");
                    setOtpSuccess("");
                    switchMode("login");
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#0ea5e9] font-medium mx-auto transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </button>
              </form>
            </div>
          )}

          {/* ── REGISTER SUCCESS ── */}
          {mode === "register-success" && (
            <div className="text-center py-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-[#0ea5e9]" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra và nhấp vào liên kết để kích hoạt tài khoản.
              </p>
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-sky-700 font-semibold">💡 Không thấy email?</p>
                <p className="text-xs text-sky-600 mt-1">Kiểm tra thư mục Spam hoặc Junk Mail. Email có thể mất vài phút để đến.</p>
              </div>
              <button
                onClick={() => switchMode("login")}
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-all shadow-md shadow-sky-100"
              >
                Về trang Đăng nhập
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === "forgot-password" && (
            <div className="animate-in fade-in duration-200">
              {!successMsg ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-sky-100 flex items-center justify-center gap-2 mt-2"
                  >
                    <SendHorizonal className="w-4 h-4" />
                    {loading ? "Đang gửi..." : "Gửi Link Đặt Lại Mật Khẩu"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{successMsg}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#0ea5e9] font-medium mt-6 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
