import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Briefcase, ShieldCheck, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Xác định vai trò dựa trên đường dẫn
  const [roleInfo, setRoleInfo] = useState({
    title: "Chào mừng trở lại!",
    subtitle: "Đăng nhập để tiếp tục hành trình của bạn",
    icon: <Briefcase className="w-10 h-10" />,
    roleName: "Ứng viên",
    redirectPath: "/"
  });

  useEffect(() => {
    if (location.pathname === "/admin") {
      setRoleInfo({
        title: "Hệ thống Quản trị",
        subtitle: "Vui lòng đăng nhập quyền Quản trị viên",
        icon: <ShieldCheck className="w-10 h-10" />,
        roleName: "Quản trị viên",
        redirectPath: "/admin/dashboard"
      });
    } else if (location.pathname === "/hr") {
      setRoleInfo({
        title: "Cổng Nhà Tuyển Dụng",
        subtitle: "Đăng nhập để quản lý phỏng vấn",
        icon: <UserCheck className="w-10 h-10" />,
        roleName: "Nhà Tuyển Dụng",
        redirectPath: "/hr/dashboard"
      });
    }
  }, [location.pathname]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate(roleInfo.redirectPath);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Cột bên trái - Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                {roleInfo.icon}
              </div>
              <span className="text-3xl font-bold">MockAI</span>
            </div>
            <p className="text-xl opacity-90">Phát triển sự nghiệp cùng Trí tuệ nhân tạo</p>
          </div>

          <div className="space-y-4 text-lg opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Hệ thống dành cho: {roleInfo.roleName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>AI hỗ trợ đánh giá năng lực chuyên sâu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Phân tích dữ liệu và tối ưu quy trình</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cột bên phải - Form đăng nhập */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{roleInfo.title}</h1>
              <p className="text-gray-600">{roleInfo.subtitle}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-sky-50 text-sky-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                Cổng {roleInfo.roleName}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-5 h-5 border-2 border-gray-200 rounded bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-all"
                    id="remember"
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none font-medium">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <Link to="#" className="text-sm text-[#0ea5e9] font-bold hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg hover:shadow-sky-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Đang xử lý..." : `Đăng Nhập ${roleInfo.roleName}`}
              </button>
            </form>

            {location.pathname === "/login" && (
              <p className="text-center mt-6 text-sm text-gray-500 font-medium">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-[#0ea5e9] font-bold hover:underline">
                  Đăng ký miễn phí
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
