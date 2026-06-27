import React, { useEffect } from "react";
import { X, TrendingUp, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../../api/blogApi";
import { useUiStore } from "../../../store/useUiStore";
import ReactionButton from "./ReactionButton";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

export default function PostDetailModal({ post, isOpen, onClose, onReact }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  // Khóa phím Esc và khóa cuộn body khi mở Modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["blogComments", post?.id],
    queryFn: async () => {
      const res = await blogApi.getComments(post.id);
      return res.data || [];
    },
    enabled: isOpen && !!post?.id
  });

  // Mutations
  const commentMutation = useMutation({
    mutationFn: (content) => blogApi.createComment(post.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    },
    onError: (err) => {
      showToast({ message: err?.response?.data?.message || "Lỗi khi gửi bình luận.", type: "error" });
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }) => blogApi.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", post.id] });
      showToast({ message: "Đã cập nhật bình luận.", type: "success" });
    },
    onError: (err) => {
      showToast({ message: err?.response?.data?.message || "Lỗi cập nhật bình luận.", type: "error" });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => blogApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
      showToast({ message: "Đã xóa bình luận.", type: "success" });
    },
    onError: (err) => {
      showToast({ message: err?.response?.data?.message || "Lỗi xóa bình luận.", type: "error" });
    }
  });

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-full bg-white dark:bg-[#0c1322] rounded-2xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Chặn click lan ra ngoài
      >
        {/* Header Modal cố định */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-10"></div> {/* Trống để căn giữa chữ */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex-1 text-center">
            Bài viết của {post.author.split(" ").pop()}
          </h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vùng nội dung có thể cuộn (Bài viết + Danh sách bình luận) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-4">
          
          {/* Header tác giả bài viết */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900 flex items-center justify-center text-lg border border-sky-150 dark:border-sky-900/30 shrink-0">
                {post.avatar ? post.avatar : "✍️"}
              </div>
              <div className="flex flex-col">
                <div className="text-[15px] font-bold dark:text-slate-100 text-gray-900">
                  {post.author}
                </div>
                <div className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-gray-500 font-medium">
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

          {/* Nội dung bài viết */}
          <div className="px-4 pb-3 flex flex-col gap-2">
            <h2 className="text-xl font-bold dark:text-slate-50 text-gray-900 leading-snug">
              {post.title}
            </h2>
            <div className="dark:text-slate-200 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.excerpt || post.content}
            </div>
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 dark:bg-slate-900/60 bg-gray-50/80 dark:text-slate-300 text-gray-600 rounded-lg text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ảnh đính kèm (chiếm trọn chiều ngang) */}
          {post.image && post.image !== "📄" && (
            <div className="w-full bg-black/5 dark:bg-black overflow-hidden flex justify-center items-center">
              <img 
                src={post.image} 
                alt={post.title} 
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>
          )}

          {/* Thanh chức năng Like / Comment */}
          <div className="px-4 py-2.5 flex items-center gap-6 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400">
            <ReactionButton 
              userReaction={post.user_reaction_type}
              onReact={onReact}
              count={post.total_reactions || 0}
            />
            <button className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="font-semibold text-[15px] pl-0.5">{post.comments || 0}</span>
            </button>
          </div>

          {/* Danh sách Comments */}
          <div className="px-4 pt-3 flex-1 bg-white dark:bg-[#0c1322]">
            <CommentList 
              comments={comments} 
              isLoading={isLoadingComments}
              onUpdate={(id, content) => updateCommentMutation.mutate({ id, content })}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
            />
          </div>
        </div>

        {/* Khung nhập Comment cố định ở dưới */}
        <div className="shrink-0 bg-white dark:bg-[#0c1322] rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)] relative z-10">
          <CommentInput 
            onSubmit={(content) => commentMutation.mutate(content)}
            isSubmitting={commentMutation.isPending}
          />
        </div>

      </div>
    </div>
  );
}
