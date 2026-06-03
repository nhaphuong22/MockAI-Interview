import React from "react";
import { Award, Star } from "lucide-react";

export function AchievementsSection({ achievements }) {
  return (
    <div className="space-y-4">
      {achievements.map((achievement, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 border-2 dark:border-white/10 border-gray-100 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] transition-all"
        >
          <div className="w-12 h-12 dark:bg-[#1e293b] bg-[#f0f9ff] rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold dark:text-white">{achievement.title}</h3>
              {achievement.verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 dark:bg-green-900/30 bg-green-50 text-green-600 rounded-full text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <p className="text-sm dark:text-slate-400 text-gray-600 mb-1">{achievement.issuer}</p>
            <p className="text-xs dark:text-slate-500 text-gray-500">{achievement.date}</p>
          </div>
        </div>
      ))}

      <button className="w-full py-4 border-2 border-dashed dark:border-white/20 dark:hover:bg-white/10 dark:text-slate-300 border-gray-300 rounded-xl text-gray-600 hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] hover:bg-[#f0f9ff] transition-all">
        + Thêm Thành Tích
      </button>
    </div>
  );
}
