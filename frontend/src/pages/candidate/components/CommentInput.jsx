import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useUiStore } from "../../../store/useUiStore";

export default function CommentInput({ onSubmit, isSubmitting }) {
  const [content, setContent] = useState("");
  const inputRef = useRef(null);
  const { isAuthenticated, user } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);

  // Focus input on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để sử dụng tính năng này.", type: "error" });
      return;
    }
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start p-4 bg-white dark:bg-[#0c1322]">
      <div className="w-9 h-9 mt-0.5 rounded-full overflow-hidden bg-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold border border-sky-100 shrink-0">
        {isAuthenticated && user?.avatar_url ? (
          <img src={user.avatar_url} alt="user avatar" className="w-full h-full object-cover" />
        ) : (
          user?.full_name?.charAt(0) || "👤"
        )}
      </div>
      <div className="flex-1 bg-[#f0f2f5] dark:bg-slate-800 rounded-3xl p-3 flex flex-col">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isAuthenticated ? "Viết câu trả lời..." : "Đăng nhập để viết bình luận..."}
          disabled={isSubmitting || !isAuthenticated}
          rows={1}
          className="w-full bg-transparent border-none outline-none dark:text-slate-100 text-gray-800 text-[15px] focus:ring-0 placeholder-gray-500 font-normal resize-none min-h-[24px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !isAuthenticated}
            className="text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors cursor-pointer mr-1"
          >
            {isSubmitting ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-[#0ea5e9]" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
