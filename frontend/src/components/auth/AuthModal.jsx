import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, Lock, Eye, EyeOff, Briefcase, User, Building, Check } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Progress from "@radix-ui/react-progress";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthModal({ isOpen, onOpenChange, initialMode = "login", onLoginSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register State
  const [regStep, setRegStep] = useState(1);
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(null); // "jobseeker" | "recruiter"

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      let redirectPath = "/";
      if (loginEmail.toLowerCase().includes("admin")) {
        redirectPath = "/admin/dashboard";
      } else if (loginEmail.toLowerCase().includes("hr") || loginEmail.toLowerCase().includes("recruiter")) {
        redirectPath = "/hr/dashboard";
      }
      onOpenChange(false);
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
      navigate(redirectPath);
    }, 1000);
  };

  const handleRegisterNext = (e) => {
    e.preventDefault();
    setRegStep(2);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("login");
      setRegStep(1); // reset for future
    }, 1000);
  };

  // Kế thừa style modal animate-in fade-in từ tailwind
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[420px] bg-white rounded-2xl shadow-xl z-50 p-6 sm:p-8 animate-in zoom-in-95 duration-200 focus:outline-none">
          <Dialog.Title className="sr-only">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</Dialog.Title>
          <Dialog.Description className="sr-only">Xác thực tài khoản MockAI</Dialog.Description>
          
          <Dialog.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Dialog.Close>

          {/* Tiêu đề chung */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-sky-100 text-sky-600 p-3 rounded-full mb-4 shadow-sm shadow-sky-100">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === "login" ? "Đăng nhập để tiếp tục hành trình của bạn" : "Bắt đầu hành trình sự nghiệp cùng AI"}
            </p>
          </div>

          {/* Form Content */}
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
                    <Checkbox.Indicator>
                      <Check className="w-3 h-3 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor="remember" className="text-[13px] text-gray-600 cursor-pointer select-none font-medium">
                    Ghi nhớ tôi
                  </label>
                </div>
                <button type="button" className="text-[13px] font-bold text-[#0ea5e9] hover:underline">Quên mật khẩu?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-sky-100 mt-2"
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
              
              <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
                *Mẹo: Dùng email có chữ "admin" hoặc "hr" để vào các dashboard tương ứng.
              </p>

              <div className="text-center mt-6 text-[13px] text-gray-500 font-medium">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={() => setMode("register")} className="text-[#0ea5e9] font-bold hover:underline ml-1">
                  Đăng ký miễn phí
                </button>
              </div>
            </form>
          )}

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
                      <input type="text" placeholder="Nguyễn Văn A" required className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" placeholder="name@example.com" required className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all [&::-ms-reveal]:hidden"
                        />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Xác nhận</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 outline-none transition-all [&::-ms-reveal]:hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all mt-6 shadow-md shadow-sky-100 active:scale-[0.98]">
                    Tiếp tục
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <p className="text-center text-[13px] font-medium mb-3 text-gray-700">Chọn vai trò của bạn</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setRole("jobseeker")}
                      className={`p-4 border-2 rounded-xl transition-all ${role === "jobseeker" ? "border-[#0ea5e9] bg-sky-50 shadow-sm" : "border-gray-100 hover:border-sky-200"}`}
                    >
                      <User className={`w-8 h-8 mx-auto mb-2 ${role === "jobseeker" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                      <div className={`text-[13px] font-bold ${role === "jobseeker" ? "text-sky-900" : "text-gray-700"}`}>Ứng viên</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("recruiter")}
                      className={`p-4 border-2 rounded-xl transition-all ${role === "recruiter" ? "border-[#0ea5e9] bg-sky-50 shadow-sm" : "border-gray-100 hover:border-sky-200"}`}
                    >
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
                <button type="button" onClick={() => setMode("login")} className="text-[#0ea5e9] font-bold hover:underline ml-1">
                  Đăng nhập
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
