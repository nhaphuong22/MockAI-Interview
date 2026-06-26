import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, User, LogOut, Settings, Briefcase, Building, Shield, FileText, PieChart, Sun, Moon, Crown, Bookmark } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AIChatWidget } from "../ai/AIChatWidget";
import { AuthModal } from "../auth/AuthModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { GlobalBackground } from "./GlobalBackground";
import { useUiStore } from "../../store/useUiStore";
import { useAuthGate } from "../../hooks/useAuthGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi } from "../../api/auth";
import { notificationApi } from "../../api/notificationApi";

// Protected Link Component
const ProtectedLink = ({ to, children, className }) => {
  const { isAuthenticated } = useAuthStore();
  const { handleProtectedNav } = useAuthGate();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      handleProtectedNav(e, to, navigate);
    }
  };

  return (
    <Link to={to} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export function Layout() {
  const {
    hideNavbar,
    authModalOpen,
    authModalMode,
    authRedirectTo,
    closeAuthModal,
  } = useUiStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();
  const userRole = user?.role?.toLowerCase();
  const isUserAdmin = userRole === 'admin';
  const isUserRecruiter = userRole === 'hr';
  const { theme, toggleTheme } = useThemeStore();
  const { handleProtectedNav } = useAuthGate();

  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await getProfileApi();
      return data?.data;
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch notifications for Facebook-style dropdown
  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    enabled: !!isAuthenticated,
    refetchInterval: 30000, // auto refetch every 30s as fallback
  });

  const notifications = Array.isArray(notificationsResponse)
    ? notificationsResponse
    : (notificationsResponse?.data || []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const currentUser = userProfile || user;

  useEffect(() => {
    // Chỉ đồng bộ lại store nếu user đang đăng nhập.
    // Tránh việc logout() làm user=null, nhưng userProfile vẫn còn cache làm setAuth() gọi lại
    if (isAuthenticated && userProfile && JSON.stringify(userProfile) !== JSON.stringify(user)) {
      useAuthStore.getState().setAuth(userProfile);
    }
  }, [userProfile, user, isAuthenticated]);
  const packageName = currentUser?.package_name || (isUserRecruiter ? "STARTER" : "MIỄN PHÍ");

  const rawAvatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || localStorage.getItem("googleAvatar") || "";
  const getAbsoluteAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const avatarUrl = rawAvatarUrl.includes("googleusercontent.com")
    ? rawAvatarUrl.replace(/=s\d+(-c)?$/, "=s384-c")
    : getAbsoluteAvatarUrl(rawAvatarUrl);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isRecruiter = location.pathname.startsWith('/hr') && !location.pathname.startsWith('/hr-interview');
  const isAdministrator = location.pathname.startsWith('/admin');
  const isCandidate = !isRecruiter && !isAdministrator;
  const isInterviewPracticePage = location.pathname.toLowerCase().replace(/\/$/, "") === "/interview-practice";
  const isInterviewRoom = location.pathname.startsWith('/hr-interview');
  const shouldHideNavbar = hideNavbar || isInterviewRoom;

  // Fix dark mode leaking into recruiter/admin dashboard
  useEffect(() => {
    if (!isCandidate) {
      document.documentElement.classList.remove('dark');
    } else {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isCandidate, theme]);

  // Xác định base path cho từng role
  const recruiterBase = "/hr/dashboard";
  const administratorBase = "/admin/dashboard";

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isCandidate && theme === 'dark' ? 'dark bg-[#0a0f1c] text-white' : 'bg-slate-50 text-gray-900'}`}>
      {isCandidate && <GlobalBackground />}
      {!shouldHideNavbar && (
        <header className="fixed top-4 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-gradient-to-r from-[#0ea5e9]/10 via-white/40 dark:via-[#0a0f1c]/40 to-[#38bdf8]/10 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(14,165,233,0.06)] rounded-full px-6 transition-all duration-500 hover:from-[#0ea5e9]/15 hover:via-white/50 dark:hover:via-[#0a0f1c]/60 hover:to-[#38bdf8]/15 hover:border-white/70 dark:hover:border-white/20 hover:shadow-[0_12px_40px_0_rgba(14,165,233,0.12)]">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to={isUserRecruiter ? recruiterBase : isUserAdmin ? administratorBase : "/"} className="flex items-center gap-2">
                  <div className="bg-[#0ea5e9] p-1.5 rounded-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xl font-bold tracking-tight ${isCandidate && theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MockAI</span>
                  {isRecruiter && <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full ml-1 uppercase">Nhà Tuyển Dụng</span>}
                  {isAdministrator && <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ml-1 uppercase">Quản trị viên</span>}
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                  {isCandidate && (
                    <>
                      <Link to="/jobs" className={`text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-[#0ea5e9]' : theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Tìm Việc
                      </Link>
                      <ProtectedLink to="/applications" className={`text-sm font-medium transition-colors ${isActive('/applications') ? 'text-[#0ea5e9]' : theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Ứng Tuyển
                      </ProtectedLink>
                      <ProtectedLink to="/community" className={`text-sm font-medium transition-colors ${isActive('/community') ? 'text-[#0ea5e9]' : theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Cộng Đồng
                      </ProtectedLink>
                      <ProtectedLink to="/cv-review" className={`text-sm font-medium transition-colors ${isActive('/cv-review') ? 'text-[#0ea5e9]' : theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        AI CV
                      </ProtectedLink>
                      <ProtectedLink to="/interview-practice" className={`text-sm font-medium transition-colors ${isActive('/interview-practice') ? 'text-[#0ea5e9]' : theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Practice
                      </ProtectedLink>
                    </>
                  )}

                  {isRecruiter && (
                    <>
                      <Link to={recruiterBase} className={`text-sm font-medium transition-colors ${location.pathname === recruiterBase ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Dashboard
                      </Link>
                      <Link to={`${recruiterBase}/manage-jobs`} className={`text-sm font-medium transition-colors ${isActive(`${recruiterBase}/manage-jobs`) ? 'text-[#0ea5e9]' : 'text-gray-600 hover:text-[#0ea5e9]'}`}>
                        Quản Lý Tin
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
                {!isUserAdmin && (
                  <ProtectedLink
                    to="/payment"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-sky-50 to-white dark:from-slate-900/80 dark:to-slate-800/80 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-950 shadow-[0_2px_8px_rgba(14,165,233,0.08)] hover:shadow-[0_4px_12px_rgba(14,165,233,0.16)]"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                    <span>
                      {!isAuthenticated ? "Nâng cấp gói" : packageName}
                    </span>
                  </ProtectedLink>
                )}
                {isCandidate && (
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title={theme === 'dark' ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                )}
                {isAuthenticated ? (
                  <>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="relative group outline-none cursor-pointer p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                          <Bell className={`w-5 h-5 transition-colors ${isCandidate && theme === 'dark' ? 'text-slate-300 group-hover:text-[#0ea5e9]' : 'text-gray-500 group-hover:text-[#0ea5e9]'}`} />
                          {unreadCount > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                          )}
                        </button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 p-0 z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                          sideOffset={8}
                          align="end"
                        >
                          <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllReadMutation.mutate();
                                }}
                                className="text-[11px] font-bold text-[#0ea5e9] hover:underline cursor-pointer"
                              >
                                Đánh dấu tất cả là đã đọc
                              </button>
                            )}
                          </div>

                          <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-xs font-medium">
                                Không có thông báo nào.
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <DropdownMenu.Item
                                  key={notification.id}
                                  asChild
                                  className="outline-none"
                                >
                                  <div
                                    onClick={() => {
                                      if (!notification.isRead) {
                                        markAsReadMutation.mutate(notification.id);
                                      }
                                      if (notification.link) {
                                        navigate(notification.link);
                                      }
                                    }}
                                    className={`p-3.5 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${!notification.isRead ? 'bg-sky-50/40 dark:bg-sky-950/10' : ''
                                      }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${notification.color || 'bg-blue-50 text-blue-600'}`}>
                                      {notification.type === 'application' ? '💼' : '🔔'}
                                    </div>

                                    <div className="flex-1 space-y-0.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-[11px] font-bold leading-tight ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'
                                          }`}>
                                          {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] shrink-0 mt-1"></span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-normal font-medium line-clamp-2">
                                        {notification.content}
                                      </p>
                                      <p className="text-[9px] text-gray-400 dark:text-slate-500 font-semibold mt-1">
                                        {new Date(notification.time).toLocaleString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          day: '2-digit',
                                          month: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </DropdownMenu.Item>
                              ))
                            )}
                          </div>

                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-gray-100 dark:border-white/5 text-center">
                            <Link
                              to={isRecruiter ? `${recruiterBase}/notifications` : isAdministrator ? `${administratorBase}/notifications` : "/notifications"}
                              className="text-[10px] font-bold text-gray-600 dark:text-slate-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors inline-block w-full"
                            >
                              Xem tất cả trong trang thông báo
                            </Link>
                          </div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-sm border border-white/50">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
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
                              to={isUserRecruiter ? `${recruiterBase}/company-profile` : isUserAdmin ? `${administratorBase}/analytics` : "/profile"}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                            >
                              {isUserRecruiter ? <Building className="w-4 h-4" /> : isUserAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              <span>{isUserRecruiter ? "Hồ sơ Công ty" : isUserAdmin ? "Quản trị viên" : "Hồ sơ Cá nhân"}</span>
                            </Link>
                          </DropdownMenu.Item>

                          <DropdownMenu.Item asChild>
                            <Link
                              to={isUserRecruiter ? `${recruiterBase}/settings` : isUserAdmin ? `${administratorBase}/system-settings` : "/settings"}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>{isUserRecruiter ? "Cài đặt tài khoản" : "Cài đặt"}</span>
                            </Link>
                          </DropdownMenu.Item>

                          {isCandidate && (
                            <>
                              <DropdownMenu.Item asChild>
                                <Link
                                  to="/saved-jobs"
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                                >
                                  <Bookmark className="w-4 h-4" />
                                  <span>Việc làm đã lưu</span>
                                </Link>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item asChild>
                                <Link
                                  to="/payment"
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-700 cursor-pointer outline-none transition-colors"
                                >
                                  <PieChart className="w-4 h-4" />
                                  <span>{packageName}</span>
                                </Link>
                              </DropdownMenu.Item>
                            </>
                          )}

                          <DropdownMenu.Separator className="h-px bg-gray-100 my-1.5" />

                          <DropdownMenu.Item asChild>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Đăng Xuất</span>
                            </button>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        useUiStore.getState().openAuthModal({ mode: 'login' });
                      }}
                      className={`text-sm font-bold transition-colors px-4 py-2 cursor-pointer ${isCandidate && theme === 'dark' ? 'text-slate-300 hover:text-[#0ea5e9]' : 'text-gray-700 hover:text-[#0ea5e9]'}`}
                    >
                      Đăng Nhập
                    </button>
                    <button
                      onClick={() => {
                        useUiStore.getState().openAuthModal({ mode: 'register' });
                      }}
                      className="text-sm font-bold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-all duration-300 px-5 py-2 rounded-xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 cursor-pointer"
                    >
                      Đăng Ký
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`min-h-[calc(100vh-64px)] ${shouldHideNavbar ? 'pt-0' : (location.pathname === '/' ? 'pt-0' : 'pt-24 md:pt-28')}`}>
        <Outlet />
      </main>

      {isCandidate && !isInterviewRoom && <AIChatWidget />}

      {/* Cửa sổ Đăng nhập / Đăng ký */}
      <AuthModal
        isOpen={authModalOpen}
        onOpenChange={closeAuthModal}
        initialMode={authModalMode}
        redirectTo={authRedirectTo}
      />
    </div>
  );
}

