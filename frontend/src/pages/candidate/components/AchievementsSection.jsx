import React from "react";
import { Award, Star } from "lucide-react";

export function AchievementsSection({ achievements }) {
  return (
    <div className="space-y-4">
      {achievements.map((achievement, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-[#0ea5e9] transition-all"
        >
          <div className="w-12 h-12 bg-[#f0f9ff] rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold">{achievement.title}</h3>
              {achievement.verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{achievement.issuer}</p>
            <p className="text-xs text-gray-500">{achievement.date}</p>
          </div>
        </div>
      ))}

      <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] hover:bg-[#f0f9ff] transition-all">
        + Thêm Thành Tích
      </button>
    </div>
  );
}
