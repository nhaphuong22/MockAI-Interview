import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff, Briefcase, Building } from "lucide-react";
import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null); // "jobseeker" | "recruiter"
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length > 8 ? (password.match(/[A-Z]/) && password.match(/[0-9]/) ? 100 : 60) : password.length > 4 ? 30 : 0;

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-[#f0f9ff]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-[#0ea5e9] p-1.5 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0ea5e9]">MockAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Bắt đầu hành trình sự nghiệp của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Bước {step} / 2</span>
              <span className="text-sm font-bold text-[#0ea5e9]">{step === 1 ? "Thông tin cá nhân" : "Xác nhận vai trò"}</span>
            </div>
            <Progress.Root className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <Progress.Indicator
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500"
                style={{ width: `${step * 50}%` }}
              />
            </Progress.Root>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Xác nhận</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all mt-6 shadow-md shadow-sky-100"
              >
                Tiếp tục
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <p className="text-center font-medium mb-4 text-gray-700">Chọn vai trò của bạn</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("jobseeker")}
                    className={`p-6 border-2 rounded-2xl transition-all ${
                      role === "jobseeker"
                        ? "border-[#0ea5e9] bg-sky-50 shadow-md ring-2 ring-sky-100"
                        : "border-gray-100 hover:border-sky-200 hover:bg-gray-50"
                    }`}
                  >
                    <User className={`w-10 h-10 mx-auto mb-3 ${role === "jobseeker" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                    <div className="text-center">
                      <div className={`font-bold mb-1 ${role === "jobseeker" ? "text-sky-900" : "text-gray-700"}`}>Ứng viên</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tìm việc làm</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`p-6 border-2 rounded-2xl transition-all ${
                      role === "recruiter"
                        ? "border-[#0ea5e9] bg-sky-50 shadow-md ring-2 ring-sky-100"
                        : "border-gray-100 hover:border-sky-200 hover:bg-gray-50"
                    }`}
                  >
                    <Building className={`w-10 h-10 mx-auto mb-3 ${role === "recruiter" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                    <div className="text-center">
                      <div className={`font-bold mb-1 ${role === "recruiter" ? "text-sky-900" : "text-gray-700"}`}>Nhà Tuyển Dụng</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tuyển nhân tài</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Checkbox.Root
                  className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-all"
                  id="terms"
                  required
                >
                  <Checkbox.Indicator>
                    <Check className="w-4 h-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-[#0ea5e9] font-bold hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-[#0ea5e9] font-bold hover:underline">
                    Chính sách bảo mật
                  </Link>
                  {" "}của MockAI.
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={!role || loading}
                  className="flex-2 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-100"
                >
                  {loading ? "Đang xử lý..." : "Đăng Ký Ngay"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-[#0ea5e9] font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
