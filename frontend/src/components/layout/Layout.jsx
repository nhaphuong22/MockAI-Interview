import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Settings, Briefcase, Building, Shield, FileText, PieChart } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AIChatWidget } from "../ai/AIChatWidget";

export function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isRecruiter = location.pathname.startsWith('/hr');
  const isAdministrator = location.pathname.startsWith('/admin');
  const isCandidate = !isRecruiter && !isAdministrator;

  // Xác định base path cho từng role
  const recruiterBase = "/hr/dashboard";
  const administratorBase = "/admin/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={isRecruiter ? recruiterBase : isAdministrator ? administratorBase : "/"} className="flex items-center gap-2">
                <div className="bg-[#0ea5e9] p-1.5 rounded-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">MockAI</span>
                {isRecruiter && <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full ml-1 uppercase">Nhà Tuyển Dụng</span>}
                {isAdministrator && <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ml-1 uppercase">Quản trị viên</span>}
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                {isCandidate && (
                  <>
                    <Link to="/jobs" className={`text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Tìm Việc
                    </Link>
                    <Link to="/applications" className={`text-sm font-medium transition-colors ${isActive('/applications') ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Ứng Tuyển
                    </Link>
                    <Link to="/community" className={`text-sm font-medium transition-colors ${isActive('/community') ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Cộng Đồng
                    </Link>
                    <Link to="/cv-review" className={`text-sm font-medium transition-colors ${isActive('/cv-review') ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      AI CV
                    </Link>
                  </>
                )}

                {isRecruiter && (
                  <>
                    <Link to={recruiterBase} className={`text-sm font-medium transition-colors ${location.pathname === recruiterBase ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Dashboard
                    </Link>
                    <Link to={`${recruiterBase}/post-job`} className={`text-sm font-medium transition-colors ${isActive(`${recruiterBase}/post-job`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Đăng Tin
                    </Link>
                    <Link to={`${recruiterBase}/applications`} className={`text-sm font-medium transition-colors ${isActive(`${recruiterBase}/applications`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Ứng Viên
                    </Link>
                    <Link to={`${recruiterBase}/analytics`} className={`text-sm font-medium transition-colors ${isActive(`${recruiterBase}/analytics`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Phân Tích
                    </Link>
                  </>
                )}

                {isAdministrator && (
                  <>
                    <Link to={administratorBase} className={`text-sm font-medium transition-colors ${location.pathname === administratorBase ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Dashboard
                    </Link>
                    <Link to={`${administratorBase}/users`} className={`text-sm font-medium transition-colors ${isActive(`${administratorBase}/users`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Người Dùng
                    </Link>
                    <Link to={`${administratorBase}/companies`} className={`text-sm font-medium transition-colors ${isActive(`${administratorBase}/companies`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Công Ty
                    </Link>
                    <Link to={`${administratorBase}/analytics`} className={`text-sm font-medium transition-colors ${isActive(`${administratorBase}/analytics`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                      Analytics
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to={isRecruiter ? `${recruiterBase}/notifications` : isAdministrator ? `${administratorBase}/notifications` : "/notifications"}>
                <div className="relative group">
                  <Bell className="w-5 h-5 text-gray-500 cursor-pointer group-hover:text-[#0ea5e9] transition-colors" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              </Link>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to={isRecruiter ? `${recruiterBase}/company-profile` : isAdministrator ? `${administratorBase}/analytics` : "/profile"}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                      >
                        {isRecruiter ? <Building className="w-4 h-4" /> : isAdministrator ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        <span>{isRecruiter ? "Công Ty" : isAdministrator ? "Quản trị viên" : "Hồ Sơ Cá Nhân"}</span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        to={isRecruiter ? `${recruiterBase}/settings` : isAdministrator ? `${administratorBase}/system-settings` : "/settings"}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Cài Đặt</span>
                      </Link>
                    </DropdownMenu.Item>

                    {isCandidate && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/payment"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                        >
                          <PieChart className="w-4 h-4" />
                          <span>Gói Pro Hội Viên</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1.5" />

                    <DropdownMenu.Item asChild>
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng Xuất</span>
                      </Link>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      {isCandidate && <AIChatWidget />}
    </div>
  );
}
