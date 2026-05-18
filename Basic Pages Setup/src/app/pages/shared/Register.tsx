import { Link, useNavigate } from "react-router";
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
  const [role, setRole] = useState<"jobseeker" | "recruiter" | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length > 8 ? (password.match(/[A-Z]/) && password.match(/[0-9]/) ? 100 : 60) : password.length > 4 ? 30 : 0;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-[#FFF3ED]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-8 h-8 text-[#E8580C]" />
            <span className="text-2xl font-bold text-[#E8580C]">JobBridge</span>
          </Link>
          <h1 className="text-2xl mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Bắt đầu hành trình tìm việc của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Bước {step} / 2</span>
              <span className="text-sm text-[#E8580C]">{step === 1 ? "Thông tin cơ bản" : "Bạn là ai?"}</span>
            </div>
            <Progress.Root className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <Progress.Indicator
                className="h-full bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] transition-all duration-500"
                style={{ width: `${step * 50}%` }}
              />
            </Progress.Root>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
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
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength === 100 ? "bg-green-500" : passwordStrength >= 60 ? "bg-[#E8580C]" : "bg-red-500"
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordStrength === 100 ? "Mạnh" : passwordStrength >= 60 ? "Trung bình" : "Yếu"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
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

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all mt-6"
              >
                Tiếp theo
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <p className="text-center mb-4 text-gray-700">Chọn vai trò của bạn</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("jobseeker")}
                    className={`p-6 border-2 rounded-xl transition-all ${
                      role === "jobseeker"
                        ? "border-[#E8580C] bg-[#FFF3ED] shadow-md"
                        : "border-gray-200 hover:border-[#E8580C] hover:bg-[#FFF3ED]"
                    }`}
                  >
                    <Briefcase className={`w-10 h-10 mx-auto mb-3 ${role === "jobseeker" ? "text-[#E8580C]" : "text-gray-400"}`} />
                    <div className="text-center">
                      <div className="font-semibold mb-1">Người Tìm Việc</div>
                      <div className="text-xs text-gray-600">Tìm kiếm cơ hội nghề nghiệp</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`p-6 border-2 rounded-xl transition-all ${
                      role === "recruiter"
                        ? "border-[#E8580C] bg-[#FFF3ED] shadow-md"
                        : "border-gray-200 hover:border-[#E8580C] hover:bg-[#FFF3ED]"
                    }`}
                  >
                    <Building className={`w-10 h-10 mx-auto mb-3 ${role === "recruiter" ? "text-[#E8580C]" : "text-gray-400"}`} />
                    <div className="text-center">
                      <div className="font-semibold mb-1">Nhà Tuyển Dụng</div>
                      <div className="text-xs text-gray-600">Tìm kiếm nhân tài</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox.Root
                  className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded bg-white hover:border-[#E8580C] data-[state=checked]:bg-[#E8580C] data-[state=checked]:border-[#E8580C] transition-colors"
                  id="terms"
                  required
                >
                  <Checkbox.Indicator>
                    <Check className="w-4 h-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-[#E8580C] hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-[#E8580C] hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={!role || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-[#E8580C] hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
