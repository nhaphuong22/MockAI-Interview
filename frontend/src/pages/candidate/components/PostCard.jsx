import React from "react";
import { TrendingUp, Heart, MessageCircle, Bookmark } from "lucide-react";

export function PostCard({ post, isLiked, onToggleLike }) {
  return (
    <article
      className={`dark:bg-[#0a0f1c]/50 bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50 hover:border-sky-100 dark:hover:border-[#0ea5e9]/50 transition-all group ${
        post.featured ? "ring-2 dark:ring-[#0ea5e9]/30 ring-sky-100" : ""
      }`}
    >
      {post.featured && (
        <div className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] px-6 py-2.5">
          <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bài Viết Nổi Bật</span>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            {post.avatar}
          </div>
          <div>
            <div className="text-sm font-bold dark:text-slate-200 text-gray-900">{post.author}</div>
            <div className="text-xs font-medium dark:text-slate-400 text-gray-500">{post.readTime}</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4 group-hover:text-[#0ea5e9] cursor-pointer transition-colors leading-tight">
          {post.title}
        </h2>

        <p className="dark:text-slate-300 text-gray-600 mb-6 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 dark:bg-sky-900/30 bg-sky-50 text-[#0ea5e9] rounded-lg text-[10px] font-bold uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t dark:border-white/10 border-gray-50">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onToggleLike(post.id)}
              className="flex items-center gap-2 dark:text-slate-400 text-gray-500 hover:text-[#0ea5e9] transition-all group/btn"
            >
              <div className={`p-2 rounded-xl transition-colors ${isLiked ? "dark:bg-sky-900/30 bg-sky-50" : "dark:group-hover/btn:bg-sky-900/30 group-hover/btn:bg-sky-50"}`}>
                <Heart
                  className={`w-5 h-5 ${
                    isLiked
                      ? "fill-[#0ea5e9] text-[#0ea5e9]"
                      : "group-hover/btn:scale-110"
                  }`}
                />
              </div>
              <span className="font-bold text-sm">
                {post.likes + (isLiked ? 1 : 0)}
              </span>
            </button>

            <button className="flex items-center gap-2 dark:text-slate-400 text-gray-500 hover:text-[#0ea5e9] transition-all group/btn">
              <div className="p-2 rounded-xl dark:group-hover/btn:bg-sky-900/30 group-hover/btn:bg-sky-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">{post.comments}</span>
            </button>
          </div>

          <button className="p-2 dark:text-slate-500 text-gray-400 hover:text-[#0ea5e9] dark:hover:bg-sky-900/30 hover:bg-sky-50 rounded-xl transition-all">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
