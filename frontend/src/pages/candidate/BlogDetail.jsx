import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Heart, Share2, Bookmark, Clock, User, MessageCircle } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { blogApi } from "../../api/blogApi";
import { useThemeStore } from "../../store/useThemeStore";
import { motion, useScroll } from "framer-motion";

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { scrollYProgress } = useScroll();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch blog detail
  const { data: blogResponse, isLoading, error } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await blogApi.getBlogById(id);
      return res.data || null;
    }
  });

  const blog = blogResponse;

  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-[#0a0f1c] bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen dark:bg-[#0a0f1c] bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-bold dark:text-white text-gray-900 mb-4">Bài viết không tồn tại</h2>
        <p className="dark:text-slate-400 text-gray-500 mb-8 max-w-md">Bài viết có thể đã bị xóa hoặc bạn không có quyền truy cập. Vui lòng quay lại trang cộng đồng.</p>
        <button 
          onClick={() => navigate('/community')}
          className="px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-medium transition-colors"
        >
          Quay về Cộng đồng
        </button>
      </div>
    );
  }

  // Format Data
  const tagsArray = Array.isArray(blog.tags) ? blog.tags : (blog.tags ? blog.tags.replace(/[{}]/g, '').split(',') : []);
  const readTime = Math.max(1, Math.ceil((blog.content || "").length / 1000));
  const createdDate = new Date(blog.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen dark:bg-[#0a0f1c] bg-gray-50 relative pb-20">
      
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#0ea5e9] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Cover Image Header */}
      <div className="w-full h-[50vh] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/60 to-transparent dark:from-[#0a0f1c] dark:via-[#0a0f1c]/80 bg-white/10 dark:to-transparent z-10" />
        <img 
          src={blog.cover_image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"} 
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation & Header Actions */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cộng đồng</span>
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isSaved ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]' : 'bg-black/20 text-white hover:bg-black/40'}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2.5 rounded-full backdrop-blur-md bg-black/20 text-white hover:bg-black/40 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            {blog.category && (
              <span className="inline-block px-4 py-1.5 bg-[#0ea5e9] text-white text-sm font-semibold rounded-full mb-4">
                {blog.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm md:text-base">
              <div className="flex items-center gap-3">
                {blog.author_avatar ? (
                  <img src={blog.author_avatar} alt={blog.author_name} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white/80" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">{blog.author_name}</p>
                  <p className="text-xs text-white/60">{createdDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 border-l border-white/20 pl-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} phút đọc</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{blog.view_count || 0} lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Article Content */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div 
              data-color-mode={theme} 
              className="prose prose-lg dark:prose-invert prose-sky max-w-none bg-white dark:bg-[#0f172a] rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100"
            >
              <MDEditor.Markdown source={blog.content} style={{ backgroundColor: 'transparent' }} />
              
              {/* Tags inside content footer */}
              {tagsArray.length > 0 && (
                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200">
                  <h4 className="text-sm font-semibold dark:text-slate-400 text-gray-500 mb-4 uppercase tracking-wider">Thẻ bài viết</h4>
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag, idx) => (
                      <span key={idx} className="px-4 py-2 dark:bg-white/5 bg-gray-100 dark:text-slate-300 text-gray-700 rounded-xl text-sm hover:bg-[#0ea5e9] hover:text-white transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="mt-8 flex items-center justify-between dark:bg-[#0f172a] bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isLiked ? 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? (blog.view_count + 1) : blog.view_count} Thích</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span>Bình luận</span>
                </button>
              </div>
              
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">A</div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">B</div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+9</div>
              </div>
            </div>
          </main>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-8">
              
              {/* Author Card */}
              <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100 text-center">
                {blog.author_avatar ? (
                  <img src={blog.author_avatar} alt={blog.author_name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-50 dark:border-white/5 mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-gray-100 dark:bg-white/5 border-4 border-gray-50 dark:border-white/5 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                  </div>
                )}
                <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-1">{blog.author_name}</h3>
                <p className="text-sm dark:text-slate-400 text-gray-500 mb-6">Người đóng góp nội dung</p>
                <button className="w-full py-2.5 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 rounded-xl font-medium transition-colors">
                  Theo dõi
                </button>
              </div>

              {/* Related Posts (Mock) */}
              <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100">
                <h3 className="text-lg font-bold dark:text-white text-gray-900 mb-4">Bài viết liên quan</h3>
                <div className="space-y-4">
                  <div className="group cursor-pointer">
                    <p className="text-sm font-medium dark:text-slate-300 text-gray-700 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">5 mẹo viết CV đánh gục nhà tuyển dụng khó tính nhất năm 2026</p>
                    <p className="text-xs dark:text-slate-500 text-gray-400 mt-1">3 ngày trước</p>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="text-sm font-medium dark:text-slate-300 text-gray-700 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">Hành trình chuyển ngành từ Non-IT sang Frontend Developer</p>
                    <p className="text-xs dark:text-slate-500 text-gray-400 mt-1">1 tuần trước</p>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="text-sm font-medium dark:text-slate-300 text-gray-700 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">Cách trả lời câu hỏi "Điểm yếu lớn nhất của bạn là gì?"</p>
                    <p className="text-xs dark:text-slate-500 text-gray-400 mt-1">2 tuần trước</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
