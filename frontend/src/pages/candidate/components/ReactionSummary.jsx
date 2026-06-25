import React from 'react';

const REACTION_ICONS = {
  LIKE: { icon: '👍', bg: 'bg-blue-500' },
  LOVE: { icon: '❤️', bg: 'bg-red-500' },
  HAHA: { icon: '😂', bg: 'bg-yellow-500' },
  WOW: { icon: '😮', bg: 'bg-yellow-500' },
  SAD: { icon: '😢', bg: 'bg-yellow-600' },
  ANGRY: { icon: '😡', bg: 'bg-orange-600' },
};

export default function ReactionSummary({ reactionCounts, totalReactions }) {
  if (!totalReactions || totalReactions === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-[22px] h-[22px] rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center border-2 border-white dark:border-slate-800">
          <span className="text-[10px] grayscale opacity-70">👍</span>
        </div>
        <span className="font-semibold text-gray-500 dark:text-slate-400">0 biểu cảm</span>
      </div>
    );
  }

  // Sort reactions by count descending and take top 3
  const topReactions = Object.entries(reactionCounts || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="flex -space-x-1.5">
        {topReactions.map((type, index) => {
          const def = REACTION_ICONS[type];
          if (!def) return null;
          return (
            <div 
              key={type} 
              className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#090e1a] shadow-sm relative z-10 transition-transform group-hover:-translate-y-0.5"
              style={{ zIndex: 10 - index }}
            >
              <span className="text-[14px] leading-none drop-shadow-sm">{def.icon}</span>
            </div>
          );
        })}
      </div>
      <span className="font-medium text-gray-600 dark:text-slate-300 hover:underline">
        {totalReactions} biểu cảm
      </span>
    </div>
  );
}
