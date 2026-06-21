import React from "react";
import { Eye } from "lucide-react";

export function CommunityRightSidebar({ trendingTags, selectedTag, setSelectedTag }) {
  return (
    <div className="sticky top-24 space-y-8">

      {/* Trending Tags card */}
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/20 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-100">
        <h3 className="text-lg font-bold dark:text-white text-gray-900 mb-6">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag && setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                selectedTag === tag
                  ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-lg shadow-sky-500/30"
                  : "dark:bg-[#0f172a] bg-gray-50 dark:hover:bg-sky-900/30 hover:bg-sky-50 dark:text-slate-400 text-gray-600 dark:hover:text-[#38bdf8] hover:text-[#0ea5e9] border-transparent dark:hover:border-sky-900/50 hover:border-sky-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight of the week card */}
      <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/20 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-100">
        <h3 className="text-lg font-bold dark:text-white text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Tiêu điểm tuần</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 group cursor-pointer">
              <div className="w-10 h-10 dark:bg-sky-900/30 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all">
                {i}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold dark:text-slate-300 text-gray-700 line-clamp-2 group-hover:text-[#0ea5e9] transition-colors leading-snug">
                  Cách Đàm Phán Lương Hiệu Quả Cho Vị Trí Senior {i}
                </p>
                <p className="text-[10px] font-bold dark:text-slate-500 text-gray-400 mt-2 flex items-center gap-1 uppercase tracking-wider">
                  <Eye className="w-3 h-3" /> 2.4k lượt đọc
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
