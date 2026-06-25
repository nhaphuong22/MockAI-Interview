import React, { useState, useRef } from "react";
import { Heart, MessageCircle, Share, Forward, MoreHorizontal, Send, Image as ImageIcon, Smile, X, Edit, Trash2, TrendingUp, Globe, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../../api/blogApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { useUiStore } from "../../../store/useUiStore";
import ReactionButton from "./ReactionButton";
import ReactionSummary from "./ReactionSummary";

export function PostCard({ post }) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);

  const { isAuthenticated, user } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);

  const hasImage = post.image && post.image !== "📄";
  const rawExcerpt = post.excerpt || "";
  const isLongContent = rawExcerpt.length > 200;
  
  // Trích xuất hiển thị: nếu chưa mở rộng thì chỉ hiện 200 ký tự đầu
  const displayExcerpt = isExpanded ? rawExcerpt : (isLongContent ? rawExcerpt.substring(0, 200) + "..." : rawExcerpt);

  // TanStack Query: Lấy danh sách bình luận của bài viết
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["blogComments", post.id],
    queryFn: async () => {
      const res = await blogApi.getComments(post.id);
      return res.data || [];
    },
    enabled: showComments
  });

  // TanStack Mutation: Gửi bình luận
  const commentMutation = useMutation({
    mutationFn: (content) => blogApi.createComment(post.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
      setCommentText("");
      showToast({ message: "Đăng bình luận thành công.", type: "success" });
    },
    onError: (err) => {
      showToast({ 
        message: err?.response?.data?.message || "Có lỗi xảy ra khi gửi bình luận.", 
        type: "error" 
      });
    }
  });

  // TanStack Mutation: React bài viết (Optimistic UI)
  const reactMutation = useMutation({
    mutationFn: (reactionType) => blogApi.reactToBlog(post.id, reactionType),
    onMutate: async (newReactionType) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["publishedBlogs"] });

      // Snapshot the previous value
      const previousBlogs = queryClient.getQueryData(["publishedBlogs"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["publishedBlogs"], (old) => {
        if (!old) return old;
        return old.map(b => {
          if (b.id === post.id) {
            let updatedTotal = b.total_reactions || 0;
            // Nếu trước đó chưa thả gì, thì cộng 1 tổng số
            if (!b.user_reaction_type) {
              updatedTotal += 1;
            } else if (b.user_reaction_type === newReactionType) {
              // Nếu bấm lại chính cái cũ -> hủy -> trừ 1 tổng số
              updatedTotal = Math.max(0, updatedTotal - 1);
            }
            // Loại biểu cảm hiện tại (null nếu bấm lại chính nó)
            const updatedReactionType = b.user_reaction_type === newReactionType ? null : newReactionType;
            return {
              ...b,
              total_reactions: updatedTotal,
              user_reaction_type: updatedReactionType
            };
          }
          return b;
        });
      });

      // Return a context object with the snapshotted value
      return { previousBlogs };
    },
    onError: (err, newReactionType, context) => {
      // Rollback to the previous value
      if (context?.previousBlogs) {
        queryClient.setQueryData(["publishedBlogs"], context.previousBlogs);
      }
      showToast({ 
        message: err?.response?.data?.message || "Không thể thực hiện tương tác biểu cảm.", 
        type: "error" 
      });
    },
    onSettled: () => {
      // Always refetch after error or success to sync fully
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    }
  });

  const handleReact = (reactionType) => {
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để sử dụng tính năng này.", type: "error" });
      return;
    }
    reactMutation.mutate(reactionType);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
    setTimeout(() => {
      if (!showComments && commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast({ message: "Đã sao chép liên kết bài viết vào bộ nhớ tạm!", type: "success" });
      })
      .catch(() => {
        showToast({ message: "Không thể sao chép liên kết.", type: "error" });
      });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để sử dụng tính năng này.", type: "error" });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <article
      className={`dark:bg-[#0c1322]/80 bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-[#0ea5e9]/5 border dark:border-slate-800/80 border-gray-100/70 transition-all duration-300 flex flex-col ${
        post.featured ? "dark:border-sky-950 border-sky-100" : ""
      }`}
    >
      {/* Container chính bên trong card */}
      <div className="p-6 md:p-8 flex flex-col gap-4">
        
        {/* Header: Thông tin tác giả */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900 flex items-center justify-center text-xl border border-sky-150 dark:border-sky-900/30 shrink-0">
              {post.avatar ? post.avatar : "✍️"}
            </div>
            <div>
              <div className="text-base font-bold dark:text-slate-100 text-gray-900 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] transition-colors">
                {post.author}
              </div>
              <div className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-gray-400 mt-0.5 font-medium">
                <span>{post.readTime}</span>
                <span>•</span>
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {post.featured && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-sky-500/10 bg-sky-50 border dark:border-sky-500/20 border-sky-100 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-[#0ea5e9]" />
              <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider">Nổi Bật</span>
            </div>
          )}
        </div>

        {/* Content: Tiêu đề và nội dung bài viết */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold dark:text-slate-50 text-gray-900 leading-snug group-hover:text-[#0ea5e9] transition-colors">
            {post.title}
          </h2>
          
          <div className="dark:text-slate-350 text-gray-650 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {displayExcerpt}
            {isLongContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="ml-2 font-bold text-[#0ea5e9] dark:text-[#38bdf8] hover:underline cursor-pointer"
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 dark:bg-slate-900/60 bg-gray-50/80 dark:text-slate-300 text-gray-600 rounded-xl text-xs font-semibold hover:dark:bg-slate-800 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover Image: Tràn viền card (hiển thị dưới text) */}
      {hasImage && (
        <div className="w-full h-64 md:h-80 overflow-hidden relative border-y dark:border-slate-850 border-gray-100/50">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      )}

      {/* Container thống kê & tương tác (Like, Comment, Share) */}
      <div className="px-6 md:px-8 py-4 bg-gray-50/30 dark:bg-[#090e1a]/20 border-t dark:border-slate-850 border-gray-100/50">
        
        {/* Action Buttons */}
        <div className="flex items-center gap-6 pt-1 text-sm text-gray-500 dark:text-slate-400">
          <ReactionButton 
            userReaction={post.user_reaction_type}
            onReact={handleReact}
            count={post.total_reactions || 0}
          />

          <button
            onClick={handleCommentClick}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer text-gray-500 dark:text-slate-400"
          >
            <MessageCircle className="w-5 h-5 stroke-[2px]" />
            <span className="font-semibold text-[15px]">{post.comments || 0}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#F3F4F6] dark:hover:bg-slate-800 transition-all cursor-pointer group"
            title="Chia sẻ"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6B7280" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:stroke-[#374151] dark:group-hover:stroke-slate-300 transition-colors"
            >
              <path d="M19 12L13 6V9.5C6 9.5 3 15 2 20C4.5 16 8 14.5 13 14.5V18L19 12Z" />
            </svg>
          </button>
        </div>

        {/* Comments Section: Khu vực bình luận thực tế */}
        {showComments && (
          <div className="mt-4 pt-4 border-t dark:border-slate-850 border-gray-100/50 flex flex-col gap-4">
            
            {/* Hộp nhập bình luận nhanh */}
            <form onSubmit={submitComment} className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0ea5e9] flex items-center justify-center text-white text-sm font-bold border border-sky-100 shrink-0">
                {isAuthenticated && user?.avatar_url ? (
                  <img src={user.avatar_url} alt="user avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || "👤"
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder={isAuthenticated ? "Viết bình luận công khai..." : "Đăng nhập để viết bình luận..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={commentMutation.isPending || !isAuthenticated}
                  className="w-full pl-5 pr-12 py-2.5 dark:bg-slate-900 bg-gray-100 border-none rounded-2xl dark:text-slate-100 text-gray-800 text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={commentMutation.isPending || !commentText.trim() || !isAuthenticated}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors cursor-pointer"
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" />
                  ) : (
                    <Send className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </form>

            {/* Danh sách bình luận */}
            <div className="flex flex-col gap-3 mt-2 max-h-72 overflow-y-auto pr-1">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0ea5e9]" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start group">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900 flex items-center justify-center border border-sky-100/50 shrink-0 text-sm font-semibold">
                      {comment.author_avatar ? (
                        <img src={comment.author_avatar} alt="author avatar" className="w-full h-full object-cover" />
                      ) : (
                        comment.author_name?.charAt(0) || "👤"
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="dark:bg-slate-900 bg-gray-100 px-4 py-2.5 rounded-2xl max-w-full">
                        <div className="text-xs font-extrabold dark:text-slate-200 text-gray-900 mb-0.5">
                          {comment.author_name}
                        </div>
                        <p className="text-sm dark:text-slate-350 text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 pl-3 font-semibold">
                        {new Date(comment.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-gray-400 dark:text-slate-500 font-medium">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
