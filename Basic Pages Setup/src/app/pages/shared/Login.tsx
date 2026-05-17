import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Briefcase } from "lucide-react";
import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-10 h-10" />
              <span className="text-3xl font-bold">JobBridge</span>
            </div>
            <p className="text-xl opacity-90">Kết nối nhân tài - Khái phá cơ hội</p>
          </div>

          <div className="space-y-4 text-lg opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>AI hỗ trợ tạo CV chuyên nghiệp</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Luyện phỏng vấn với AI thông minh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Kết nối với 5,000+ công ty hàng đầu</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl mb-2">Chào mừng trở lại!</h1>
              <p className="text-gray-600">Đăng nhập để tiếp tục hành trình của bạn</p>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all">
                <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Đăng nhập với LinkedIn</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-5 h-5 border-2 border-gray-300 rounded bg-white hover:border-[#E8580C] data-[state=checked]:bg-[#E8580C] data-[state=checked]:border-[#E8580C] transition-colors"
                    id="remember"
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-[#E8580C] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-[#E8580C] hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
