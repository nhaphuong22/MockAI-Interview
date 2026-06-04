import React from "react";
import { TrendingUp, Heart, MessageCircle, Bookmark } from "lucide-react";

export function PostCard({ post, isLiked, onToggleLike }) {
  const hasImage = post.image && post.image !== "📄";

  return (
    <article
      className={`relative dark:bg-[#0c1322] bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/20 dark:shadow-none border dark:border-slate-800 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full ${
        post.featured ? "dark:border-sky-900/50 border-sky-100" : ""
      }`}
    >
      {/* Optional Top Accent for Featured */}
      {post.featured && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"></div>
      )}

      {/* Cover Image (Only if exists) */}
      {hasImage && (
        <div className="w-full h-48 overflow-hidden relative">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] to-transparent opacity-60"></div>
        </div>
      )}

      <div className={`p-6 flex flex-col flex-1 ${hasImage ? 'pt-2' : 'pt-6'}`}>
        
        {/* Header: Author & Featured Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-slate-800 flex items-center justify-center text-lg border border-sky-200 dark:border-sky-800/50 shrink-0">
              {post.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold dark:text-slate-200 text-gray-900">{post.author}</div>
              <div className="text-xs dark:text-slate-500 text-gray-500">{post.readTime}</div>
            </div>
          </div>

          {post.featured && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full dark:bg-sky-500/10 bg-sky-50 border dark:border-sky-500/20 border-sky-100">
              <TrendingUp className="w-3 h-3 text-[#0ea5e9]" />
              <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider">Nổi Bật</span>
            </div>
          )}
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold dark:text-slate-100 text-gray-900 mb-2 group-hover:text-[#0ea5e9] transition-colors leading-snug line-clamp-2">
          {post.title}
        </h2>

        <p className="dark:text-slate-400 text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed flex-1">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 dark:bg-slate-800/50 bg-gray-50 dark:text-slate-300 text-gray-600 rounded-md text-[11px] font-medium transition-colors hover:dark:bg-slate-700 hover:bg-gray-100 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2.5 py-1 dark:text-slate-500 text-gray-400 text-[11px] font-medium">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800/80 border-gray-100 mt-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(post.id);
              }}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isLiked ? "text-rose-500" : "dark:text-slate-400 text-gray-500 hover:text-rose-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>

            <button className="flex items-center gap-1.5 text-sm font-medium dark:text-slate-400 text-gray-500 hover:text-[#0ea5e9] transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
          </div>

          <button className="text-gray-400 dark:text-slate-500 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
