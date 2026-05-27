import React from "react";
import { ChevronRight, LogOut } from "lucide-react";

export function SettingsSidebar({ user, activeTab, setActiveTab, menuItems, logout, fullName, avatarUrl }) {
  return (
    <div className="dark:bg-[#0f172a] bg-white rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border dark:border-white/10 border-gray-50 transition-colors duration-500">
      <div className="p-6 text-center border-b dark:border-white/10 border-gray-50 mb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-sky-100 dark:shadow-none overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            "👨‍💻"
          )}
        </div>
        <h3 className="text-xl font-bold dark:text-white text-slate-900 truncate">{fullName || "Ứng viên MockAI"}</h3>
        <p className="text-[11px] dark:text-slate-400 text-slate-500 font-medium truncate mt-1">{user?.email}</p>
        <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-widest mt-2 px-3 py-1 dark:bg-[#0ea5e9]/10 bg-sky-50 rounded-full inline-block">
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
                  ? "dark:bg-[#0ea5e9]/10 bg-sky-50 text-[#0ea5e9]" 
                  : "dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-50 dark:hover:text-white hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? "dark:bg-[#0ea5e9]/20 bg-white shadow-sm" : "dark:bg-slate-800 bg-gray-100 dark:group-hover:bg-slate-700 group-hover:bg-white"}`}>
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
      <div className="mt-4 pt-4 border-t dark:border-white/10 border-gray-50">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
        >
          <div className="p-2 dark:bg-red-500/20 bg-red-100 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
