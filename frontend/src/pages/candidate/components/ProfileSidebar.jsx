import React from "react";
import { Briefcase, GraduationCap } from "lucide-react";

export function ProfileSidebar() {
  return (
    <div className="space-y-6">
      {/* AI Score Card */}
      <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 p-6">
        <h3 className="font-semibold dark:text-white mb-4">AI Score</h3>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#f3f4f6"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.88)}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl text-[#0ea5e9]">88</div>
              <div className="text-xs dark:text-slate-400 text-gray-600">/ 100</div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm dark:text-slate-400 text-gray-600">
          Hồ sơ của bạn có độ phù hợp cao với các công ty công nghệ
        </p>
      </div>

      {/* Profile Views Card */}
      <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl p-6 text-white">
        <h3 className="text-lg mb-2">Lượt Xem Hồ Sơ</h3>
        <div className="text-4xl mb-1">2,456</div>
        <p className="text-sm opacity-90">Trong 30 ngày qua</p>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span>Tuần này</span>
            <span className="font-semibold">+23%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 p-6">
        <h3 className="font-semibold dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 dark:bg-[#1e293b] bg-[#f0f9ff] text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9] hover:text-white transition-all flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <span>AI Phỏng Vấn Thử</span>
          </button>
          <button className="w-full px-4 py-3 border-2 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 border-gray-200 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-all flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span>Khóa Học Đề Xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
