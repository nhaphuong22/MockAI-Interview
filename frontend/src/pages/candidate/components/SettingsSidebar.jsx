import React from "react";
import { ChevronRight, LogOut } from "lucide-react";

export function SettingsSidebar({ user, activeTab, setActiveTab, menuItems, logout, fullName, avatarUrl }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-4 shadow-xl shadow-gray-200/20 border border-gray-50 dark:border-white/5">
      <div className="p-6 text-center border-b border-gray-50 dark:border-white/5 mb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-sky-100 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            "👨‍💻"
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{fullName || "Ứng viên MockAI"}</h3>
        <p className="text-[11px] text-gray-400 font-medium truncate mt-1">{user?.email}</p>
        <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-widest mt-2 px-3 py-1 bg-sky-50 rounded-full inline-block">
          {user?.role === "HR" ? "Recruiter Member" : "Candidate Member"}
        </p>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                  ? "bg-sky-50 text-[#0ea5e9]" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-white/5 hover:text-gray-900 dark:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? "bg-white dark:bg-[#0f172a] shadow-sm" : "bg-gray-100 group-hover:bg-white dark:bg-[#0f172a]"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-[10px] opacity-70 font-medium">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? "rotate-90" : "group-hover:translate-x-1"}`} />
            </button>
          );
        })}
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
        >
          <div className="p-2 bg-red-100 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
