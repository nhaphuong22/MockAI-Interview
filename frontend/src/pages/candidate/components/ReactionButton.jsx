import React, { useState, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = [
  { type: 'LIKE', label: 'Thích', icon: '👍', color: 'text-blue-500' },
  { type: 'LOVE', label: 'Yêu thích', icon: '❤️', color: 'text-red-500' },
  { type: 'HAHA', label: 'Haha', icon: '😂', color: 'text-yellow-500' },
  { type: 'WOW', label: 'Wow', icon: '😮', color: 'text-yellow-500' },
  { type: 'SAD', label: 'Buồn', icon: '😢', color: 'text-yellow-600' },
  { type: 'ANGRY', label: 'Phẫn nộ', icon: '😡', color: 'text-orange-600' },
];

export default function ReactionButton({ userReaction, onReact, count }) {
  const [showPopup, setShowPopup] = useState(false);
  let timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Thêm delay nhỏ tránh hiển thị popup khi vô tình lướt chuột ngang qua
    timeoutRef.current = setTimeout(() => setShowPopup(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowPopup(false), 300);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onReact(userReaction ? userReaction : 'LIKE');
    setShowPopup(false);
  };

  const currentReactionDef = REACTIONS.find(r => r.type === userReaction);

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-[calc(100%+6px)] left-0 md:-left-4 bg-white dark:bg-[#1e293b] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-100/80 dark:border-slate-700/80 px-4 py-2 flex items-center gap-1.5 z-50 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {REACTIONS.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.04, 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 20 
                }}
                whileHover={{ scale: 1.4, y: -6, originY: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(reaction.type);
                  setShowPopup(false);
                }}
                className="text-3xl leading-none outline-none relative mx-0.5 hover:z-10 transition-colors drop-shadow-sm"
                title={reaction.label}
              >
                {reaction.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all cursor-pointer hover:bg-sky-50/50 dark:hover:bg-slate-800/50 ${
          currentReactionDef ? currentReactionDef.color : 'text-gray-500 dark:text-slate-400'
        }`}
      >
        {currentReactionDef ? (
          <motion.span 
            initial={{ scale: 0.5 }} 
            animate={{ scale: 1 }} 
            key={currentReactionDef.type}
            className="flex items-center justify-center leading-none drop-shadow-sm"
          >
            {currentReactionDef.type === 'LIKE' ? (
              <ThumbsUp className="w-5 h-5 stroke-[2px] fill-blue-500 text-blue-500" />
            ) : (
              <span className="text-[20px]">{currentReactionDef.icon}</span>
            )}
          </motion.span>
        ) : (
          <ThumbsUp className="w-5 h-5 stroke-[2px]" />
        )}
        
        {count > 0 && (
          <span className="font-semibold text-[15px] pl-0.5">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
