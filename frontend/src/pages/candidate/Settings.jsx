import React, { useState } from "react";
import { User, Lock, Bell, CreditCard, Shield, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { AccountSettings } from "./components/AccountSettings";
import { PlaceholderSettings } from "./components/PlaceholderSettings";
import { SecuritySettings } from "./components/SecuritySettings";

export function Settings() {
  const { user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  const menuItems = [
    { id: "account", icon: User, title: "Thông tin cá nhân", desc: "Quản lý tên, email và số điện thoại" },
    { id: "security", icon: Lock, title: "Mật khẩu & Bảo mật", desc: "Đổi mật khẩu và cài đặt 2FA" },
    { id: "notifications", icon: Bell, title: "Cài đặt thông báo", desc: "Quản lý email và thông báo đẩy" },
    { id: "billing", icon: CreditCard, title: "Gói dịch vụ & Thanh toán", desc: "Nâng cấp Pro và lịch sử giao dịch" },
    { id: "privacy", icon: Shield, title: "Quyền riêng tư", desc: "Quản lý dữ liệu và quyền truy cập" },
    { id: "language", icon: Globe, title: "Ngôn ngữ & Vùng", desc: "Tiếng Việt (Việt Nam)" },
  ];

  const handleUpdateUser = (updatedData) => {
    setAuth({
      ...user,
      ...updatedData
    });
  };

  const activeMenu = menuItems.find(item => item.id === activeTab);
  const fullName = user?.full_name || user?.fullName || "";
  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || "";
  const avatarUrl = rawAvatarUrl.includes("googleusercontent.com")
    ? rawAvatarUrl.replace(/=s\d+(-c)?$/, "=s384-c")
    : rawAvatarUrl;

  return (
    <div className="dark:bg-[#0a0f1c] bg-slate-50 transition-colors duration-500 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-white/5 hover:text-[#0ea5e9] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold dark:text-white text-slate-900 mb-2 tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-lg dark:text-slate-400 text-slate-600 font-medium">Tùy chỉnh trải nghiệm MockAI theo cách của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4">
            <SettingsSidebar 
              user={user} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              menuItems={menuItems} 
              logout={logout}
              fullName={fullName}
              avatarUrl={avatarUrl}
            />
          </aside>

          <main className="lg:col-span-8">
            <div className="dark:bg-[#0f172a] bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border dark:border-white/10 border-gray-50 min-h-[600px] transition-colors duration-500">
              {activeTab === "account" ? (
                <AccountSettings 
                  user={user} 
                  onUpdateUser={handleUpdateUser} 
                />
              ) : activeTab === "security" ? (
                <SecuritySettings />
              ) : (
                <PlaceholderSettings 
                  title={activeMenu ? activeMenu.title : ""} 
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export default Settings;
