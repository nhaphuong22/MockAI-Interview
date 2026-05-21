import React from "react";

export function CommunityLeftSidebar({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  topContributors 
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/20 border border-gray-100 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Danh Mục</h3>
      <div className="space-y-1.5">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              selectedCategory === category.id
                ? "bg-[#0ea5e9] text-white shadow-lg shadow-sky-100"
                : "hover:bg-sky-50 text-gray-600 hover:text-[#0ea5e9]"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Thành viên tích cực</h3>
        <div className="space-y-4">
          {topContributors.map((contributor, index) => (
            <div key={index} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                {contributor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0ea5e9] transition-colors">
                  {contributor.name}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {contributor.posts} bài viết
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
