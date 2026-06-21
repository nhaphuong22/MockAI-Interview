import React, { useState, useRef } from "react";
import { TrendingUp, Heart, MessageCircle, Share2, Globe, Send, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../../api/blogApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { useUiStore } from "../../../store/useUiStore";

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

  // TanStack Mutation: Like bài viết
  const likeMutation = useMutation({
    mutationFn: () => blogApi.toggleLikeBlog(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    },
    onError: (err) => {
      showToast({ 
        message: err?.response?.data?.message || "Không thể thực hiện tương tác thích.", 
        type: "error" 
      });
    }
  });

  const handleLike = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để sử dụng tính năng này.", type: "error" });
      return;
    }
    likeMutation.mutate();
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
        <div className="w-full max-h-96 overflow-hidden relative border-y dark:border-slate-850 border-gray-100/50">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      )}

      {/* Container thống kê & tương tác (Like, Comment, Share) */}
      <div className="px-6 md:px-8 py-4 bg-gray-50/30 dark:bg-[#090e1a]/20 border-t dark:border-slate-850 border-gray-100/50">
        
        {/* Stats Line: Hiển thị đếm số lượng */}
        <div className="flex justify-between items-center text-xs md:text-sm text-gray-400 dark:text-slate-500 pb-3 border-b dark:border-slate-850 border-gray-100/50">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#0ea5e9] flex items-center justify-center shadow-md shadow-sky-100 dark:shadow-none">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-semibold text-gray-600 dark:text-slate-300">{post.likes} lượt thích</span>
          </div>
          <div className="hover:underline cursor-pointer font-medium" onClick={handleCommentClick}>
            {post.comments} bình luận
          </div>
        </div>

        {/* Action Buttons: Hàng các nút Like, Comment, Share */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-sm text-gray-500 dark:text-slate-400 font-bold">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2.5 py-2.5 rounded-xl hover:bg-sky-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer ${
              post.isLiked ? "text-[#0ea5e9] dark:text-[#38bdf8]" : ""
            }`}
          >
            <Heart className={`w-5 h-5 transition-transform active:scale-125 ${post.isLiked ? "fill-[#0ea5e9] dark:fill-[#38bdf8] text-[#0ea5e9] dark:text-[#38bdf8]" : ""}`} />
            <span>Thích</span>
          </button>

          <button
            onClick={handleCommentClick}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl hover:bg-sky-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Bình luận</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl hover:bg-sky-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>Chia sẻ</span>
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
