import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Edit, Download, Share2 } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

export function ProfileHeader({ user, completeness, avatarUrl }) {
  return (
    <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 overflow-hidden mb-6">
      <div className="h-48 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaW力量PSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row gap-6 -mt-20 relative">
          <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] ring-4 dark:ring-[#0a0f1c] ring-white flex items-center justify-center text-6xl flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              "👨‍💻"
            )}
          </div>

          <div className="flex-1 pt-24 md:pt-0 md:mt-20">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl dark:text-white font-bold mb-2">{user?.full_name || user?.fullName || "Chưa cập nhật tên"}</h1>
                <p className="text-lg dark:text-slate-400 text-gray-600 mb-2 font-medium">
                  {user?.role === "HR" ? "Recruiter" : "Candidate Member"}
                </p>
                <div className="flex flex-wrap items-center gap-4 dark:text-slate-400 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user?.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email || "Chưa cập nhật email"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone || "Chưa cập nhật SĐT"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/settings" className="px-4 py-2 border-2 dark:border-white/20 dark:hover:bg-white/10 dark:text-slate-300 border-gray-300 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all flex items-center gap-2 text-sm font-semibold">
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh Sửa</span>
                </Link>
                <button className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold">
                  <Download className="w-4 h-4" />
                  <span>Tải CV</span>
                </button>
                <button className="p-2 border-2 dark:border-white/20 dark:text-slate-300 dark:hover:border-[#0ea5e9] dark:hover:bg-white/10 border-gray-300 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="dark:bg-[#1e293b] bg-[#f0f9ff] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-slate-300 text-gray-700">Hoàn thiện hồ sơ</span>
                <span className="text-sm font-semibold text-[#0ea5e9]">{completeness}%</span>
              </div>
              <Progress.Root className="h-2 dark:bg-[#0f172a] bg-white rounded-full overflow-hidden">
                <Progress.Indicator
                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </Progress.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
