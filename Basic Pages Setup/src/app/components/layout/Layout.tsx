import { Outlet, Link, useLocation } from "react-router";
import { Bell, User, LogOut, Settings, Briefcase, Building, Shield, FileText, PieChart } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AIChatWidget } from "../ai/AIChatWidget";

export function Layout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isHR = location.pathname.startsWith('/hr');
  const isAdmin = location.pathname.startsWith('/admin');
  const isJobSeeker = !isHR && !isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={isHR ? "/hr" : isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
                <Briefcase className="w-7 h-7 text-[#E8580C]" />
                <span className="text-xl font-bold text-[#E8580C]">JobBridge</span>
                {isHR && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">HR</span>}
                {isAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">Admin</span>}
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                {isJobSeeker && (
                  <>
                    <Link to="/jobs" className={`text-sm transition-colors ${isActive('/jobs') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Tìm Việc
                    </Link>
                    <Link to="/applications" className={`text-sm transition-colors ${isActive('/applications') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Ứng Tuyển
                    </Link>
                    <Link to="/community" className={`text-sm transition-colors ${isActive('/community') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Cộng Đồng
                    </Link>
                    <Link to="/cv-review" className={`text-sm transition-colors ${isActive('/cv-review') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      AI CV
                    </Link>
                  </>
                )}

                {isHR && (
                  <>
                    <Link to="/hr" className={`text-sm transition-colors ${location.pathname === '/hr' ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Dashboard
                    </Link>
                    <Link to="/hr/post-job" className={`text-sm transition-colors ${isActive('/hr/post-job') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Đăng Tin
                    </Link>
                    <Link to="/hr/applications" className={`text-sm transition-colors ${isActive('/hr/applications') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Ứng Viên
                    </Link>
                    <Link to="/hr/analytics" className={`text-sm transition-colors ${isActive('/hr/analytics') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Phân Tích
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin" className={`text-sm transition-colors ${location.pathname === '/admin' ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className={`text-sm transition-colors ${isActive('/admin/users') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Người Dùng
                    </Link>
                    <Link to="/admin/companies" className={`text-sm transition-colors ${isActive('/admin/companies') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Công Ty
                    </Link>
                    <Link to="/admin/analytics" className={`text-sm transition-colors ${isActive('/admin/analytics') ? 'text-[#E8580C] font-semibold' : 'text-gray-700 hover:text-[#E8580C]'}`}>
                      Analytics
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to={isHR ? "/hr/notifications" : isAdmin ? "/admin" : "/notifications"}>
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#E8580C] transition-colors" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </Link>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] flex items-center justify-center ring-2 ring-[#E8580C]/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 z-50"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to={isHR ? "/hr/company-profile" : isAdmin ? "/admin" : "/profile"}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer outline-none"
                      >
                        {isHR ? <Building className="w-4 h-4" /> : isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        <span>{isHR ? "Công Ty" : isAdmin ? "Admin" : "Hồ Sơ"}</span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        to={isHR ? "/hr/settings" : isAdmin ? "/admin/system-settings" : "/settings"}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer outline-none"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Cài Đặt</span>
                      </Link>
                    </DropdownMenu.Item>

                    {isJobSeeker && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/payment"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer outline-none"
                        >
                          <PieChart className="w-4 h-4" />
                          <span>Nâng Cấp Pro</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1.5" />

                    <DropdownMenu.Item asChild>
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none"
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

      {isJobSeeker && <AIChatWidget />}
    </div>
  );
}
