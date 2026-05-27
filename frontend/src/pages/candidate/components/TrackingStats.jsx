import React from "react";

export function TrackingStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
        <div className="text-4xl font-bold dark:text-white text-gray-900 mb-1">{stats.reviewing}</div>
        <div className="text-[10px] font-bold dark:text-yellow-400 text-yellow-600 uppercase tracking-widest">Đang Xem Hồ Sơ</div>
      </div>
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
        <div className="text-4xl font-bold dark:text-white text-gray-900 mb-1">{stats.interview}</div>
        <div className="text-[10px] font-bold dark:text-blue-400 text-blue-600 uppercase tracking-widest">Lịch Phỏng Vấn</div>
      </div>
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
        <div className="text-4xl font-bold dark:text-white text-gray-900 mb-1">{stats.accepted}</div>
        <div className="text-[10px] font-bold dark:text-green-400 text-green-600 uppercase tracking-widest">Đã Trúng Tuyển</div>
      </div>
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
        <div className="text-4xl font-bold dark:text-white text-gray-900 mb-1">{stats.rejected}</div>
        <div className="text-[10px] font-bold dark:text-red-400 text-red-600 uppercase tracking-widest">Không Phù Hợp</div>
      </div>
    </div>
  );
}
