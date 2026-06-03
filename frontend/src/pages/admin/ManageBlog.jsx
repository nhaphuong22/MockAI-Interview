import { useState, useEffect } from "react";
import { 
  Search, 
  FileText, 
  Check, 
  Trash2, 
  Eye, 
  Calendar, 
  User,
  AlertTriangle,
  X,
  FileCheck,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { getAllAdminBlogs, reviewBlog, deleteBlog } from "../../api/adminApi";
import confetti from "canvas-confetti";

export function ManageBlog() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "published"
  const [refetchKey, setRefetchKey] = useState(0);
  
  // Dialog state
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState(null);

  const triggerRefetch = () => setRefetchKey(prev => prev + 1);

  // Fetch blogs from backend API
  useEffect(() => {
    let active = true;
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const res = await getAllAdminBlogs();
        if (active) {
          setBlogs(res.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài viết:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchBlogs();
    return () => {
      active = false;
    };
  }, [refetchKey]);

  // Approve Draft Post via backend API
  const handleApprovePost = async (id) => {
    try {
      await reviewBlog(id, "Published");
      setBlogs(prev => prev.map(post => {
        if (post.id === id) {
          return { ...post, status: "Published" };
        }
        return post;
      }));

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#38bdf8', '#10b981']
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt bài viết:", error);
    } finally {
      triggerRefetch();
    }
  };

  // Delete Post (any status) via backend API
  const handleDeletePost = async (id) => {
    try {
      await deleteBlog(id);
      setBlogs(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error("Lỗi khi gỡ bài viết:", error);
    } finally {
      setDeleteConfirmBlog(null);
      triggerRefetch();
    }
  };

  // Counts
  const pendingCount = blogs.filter(post => post.status === "Draft").length;
  const publishedCount = blogs.filter(post => post.status === "Published").length;

  // Filtered blogs
  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "pending" ? post.status === "Draft" : post.status === "Published";
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kiểm Duyệt Bài Viết</h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt nhanh bài đăng mới hoặc gỡ bỏ các bài viết (kể cả bài đã đăng) vi phạm chính sách nội dung.</p>
        </div>

        {/* Tab & Search Toolbar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs for Logical Separation */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "pending" 
                  ? "bg-white text-[#0ea5e9] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Chờ Kiểm Duyệt
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "pending" ? "bg-sky-50 text-[#0ea5e9]" : "bg-slate-200 text-slate-600"
              }`}>
                {pendingCount}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab("published")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "published" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Globe className="w-4 h-4" />
              Đã Xuất Bản
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>
                {publishedCount}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết hoặc tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* Blog Posts Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-bold">Đang tải danh sách bài viết...</p>
              </div>
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((post) => (
                <motion.div 
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100/85 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header bar of Card */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold bg-sky-50 text-[#0ea5e9] border border-sky-100 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {post.status === "Published" ? "Đã Xuất Bản" : "Chờ Kiểm Duyệt"}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2">{post.title}</h3>
                    <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{post.summary}</p>
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-[10px] font-bold text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        <span className="truncate">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span>{post.postedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-300" />
                        <span>{post.views} Lượt xem</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {/* Delete Post Button (Always Active for deletion) */}
                    <button 
                      onClick={() => setDeleteConfirmBlog(post)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all outline-none"
                      title={activeTab === "pending" ? "Từ chối bài viết" : "Gỡ bài viết đã đăng"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {activeTab === "pending" ? "Từ Chối" : "Gỡ Bài"}
                    </button>

                    {/* Approve Draft Post Button */}
                    {post.status === "Draft" && (
                      <button 
                        onClick={() => handleApprovePost(post.id)}
                        className="px-3.5 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all outline-none"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Duyệt & Đăng
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-slate-400 font-semibold text-xs bg-white rounded-3xl border border-slate-100">
                {activeTab === "pending" 
                  ? "Tuyệt vời! Không còn bài viết nào chờ kiểm duyệt." 
                  : "Không tìm thấy bài viết đã xuất bản nào!"}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {deleteConfirmBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmBlog(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-xl border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {deleteConfirmBlog.status === "Draft" ? "Từ Chối Bài Viết?" : "Gỡ Bài Viết Đã Đăng?"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn xóa bài viết <strong>"{deleteConfirmBlog.title}"</strong> của tác giả <strong>{deleteConfirmBlog.author}</strong>? 
                  <span className="block text-rose-500 font-bold mt-2">Hành động này sẽ xóa/gỡ bài viết vĩnh viễn và không thể khôi phục!</span>
                </p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setDeleteConfirmBlog(null)}
                    className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    onClick={() => handleDeletePost(deleteConfirmBlog.id)}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-rose-200"
                  >
                    Xác Nhận Xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
