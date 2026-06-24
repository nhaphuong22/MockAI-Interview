import { useState, useEffect } from "react";
import { Search, Loader2, Image as ImageIcon, Smile, Tag, X, Globe, Sparkles, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../api/blogApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useUiStore } from "../../store/useUiStore";
import { CommunityLeftSidebar } from "./components/CommunityLeftSidebar";
import { CommunityRightSidebar } from "./components/CommunityRightSidebar";
import { PostCard } from "./components/PostCard";

const categories = [
  { id: "all", name: "Tất Cả Bài Viết", active: true },
  { id: "cv", name: "Mẹo Viết CV", active: false },
  { id: "interview", name: "Kinh Nghiệm Phỏng Vấn", active: false },
  { id: "career", name: "Lời Khuyên Sự Nghiệp", active: false },
  { id: "tech", name: "Xu Hướng Công Nghệ", active: false },
  { id: "salary", name: "Thông Tin Mức Lương", active: false },
];

const topContributors = [
  { name: "Nguyễn Minh Anh", posts: 45, avatar: "👩‍💼" },
  { name: "Trần Văn B", posts: 38, avatar: "👨‍💻" },
  { name: "Lê Thị C", posts: 32, avatar: "👩‍🔬" },
];

const trendingTags = ["#RemoteWork", "#AI", "#Startup", "#CareerGrowth", "#Networking", "#Interview"];

export function Community() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States cho Form đăng bài nhanh
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("cv");
  const [postTags, setPostTags] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lưu trữ bài đăng nháp vừa gửi duyệt cục bộ trên UI
  const [localPosts, setLocalPosts] = useState([]);

  const handleWritePost = () => {
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để viết bài.", type: "error" });
      return;
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  // Submit bài viết
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showToast({ message: "Vui lòng nhập đầy đủ tiêu đề và nội dung.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = null;
      
      // 1. Upload ảnh bìa nếu có
      if (coverImage) {
        const uploadRes = await blogApi.uploadCoverImage(coverImage);
        uploadedImageUrl = uploadRes.url || uploadRes.data?.url;
      }

      // 2. Tạo bài viết nháp (draft)
      const tagsArray = postTags
        .split(",")
        .map((t) => t.trim().replace("#", ""))
        .filter((t) => t.length > 0);

      // Map id category sang dạng category string lưu trong DB
      const categoryMapping = {
        cv: "Career Tips",
        interview: "Interview Guide",
        career: "Industry News",
        tech: "Industry News",
        salary: "Career Tips"
      };
      
      const categoryName = categoryMapping[postCategory] || "Career Tips";

      const draftRes = await blogApi.createDraft({
        title: postTitle,
        content: postContent,
        tags: tagsArray,
        category: categoryName,
        cover_image_url: uploadedImageUrl
      });

      const newBlogId = draftRes.data?.id || draftRes.id;

      // 3. Gửi duyệt bài viết
      const submitRes = await blogApi.submitForReview(newBlogId);
      const updatedArticle = submitRes.data || submitRes;
      const isApproved = updatedArticle.status === 'PUBLISHED';

      if (isApproved) {
        // Chỉ lưu bài viết vào state local nếu được duyệt thành công để hiển thị tức thì
        const newLocalPost = {
          id: newBlogId || Date.now(),
          featured: false,
          title: postTitle,
          excerpt: postContent.substring(0, 150) + "...",
          author: user?.full_name || "Bạn",
          avatar: user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="font-extrabold text-white text-sm">{user?.full_name?.charAt(0) || "👤"}</span>
          ),
          readTime: Math.max(1, Math.ceil(postContent.length / 1000)) + " phút đọc",
          likes: 0,
          comments: 0,
          tags: tagsArray,
          image: uploadedImageUrl || "📄",
          isLiked: false,
          isPendingApproval: false,
          isRejected: false,
          rejectReason: null
        };

        setLocalPosts((prev) => [newLocalPost, ...prev]);

        showToast({ 
          message: "Bài viết đã được AI tự động duyệt và xuất bản thành công!", 
          type: "success" 
        });
      } else {
        // Nếu bị từ chối, chỉ hiển thị thông báo lỗi bên phải màn hình
        showToast({ 
          message: `Bài viết bị AI từ chối: ${updatedArticle.reject_reason || "Nội dung không phù hợp."}`, 
          type: "error" 
        });
      }

      // Xóa form và đóng modal
      setPostTitle("");
      setPostContent("");
      setPostTags("");
      removeCoverImage();
      setIsModalOpen(false);

      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    } catch (err) {
      console.error("Publish Error:", err);
      showToast({ 
        message: err?.response?.data?.message || "Có lỗi xảy ra khi đăng bài viết.", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // React Query: Lấy danh sách bài viết từ backend
  const { data: blogResponse, isLoading } = useQuery({
    queryKey: ["publishedBlogs"],
    queryFn: async () => {
      try {
        const res = await blogApi.getPublishedBlogs();
        if (Array.isArray(res)) return res;
        return res.data || [];
      } catch (err) {
        console.error("API Error:", err);
        return [];
      }
    }
  });

  // Dọn dẹp localPosts khi dữ liệu server được đồng bộ về thành công
  useEffect(() => {
    if (blogResponse) {
      setLocalPosts([]);
    }
  }, [blogResponse]);

  const apiPosts = blogResponse || [];

  const formattedPosts = apiPosts.map(post => {
    const stripHtml = (html) => {
      if (!html) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
    const plainText = stripHtml(post.content);
    const tagsArray = Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.replace(/[{}]/g, '').split(',') : []);

    return {
      id: post.id,
      featured: post.view_count > 100, 
      title: post.title,
      excerpt: plainText, // Giữ nguyên nội dung gốc để PostCard tự cắt
      author: post.author_name || "Tác giả",
      avatar: post.author_avatar ? (
        <img src={post.author_avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="font-extrabold text-white text-sm">{(post.author_name || "A").charAt(0)}</span>
      ),
      readTime: Math.max(1, Math.ceil(plainText.length / 1000)) + " phút đọc",
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      tags: tagsArray.filter(t => t),
      image: post.cover_image_url || "📄",
      isLiked: post.is_liked_by_user || false,
      category: post.category || ""
    };
  });

  // Gộp localPosts và formattedPosts
  const allPosts = [...localPosts, ...formattedPosts];

  // Filter bài viết
  const filteredPosts = allPosts.filter(post => {
    const postTags = post.tags || [];
    
    let matchesCategory;
    if (selectedCategory === "all") {
      matchesCategory = true;
    } else {
      const categoryMapping = {
        cv: "Career Tips",
        interview: "Interview Guide",
        career: "Industry News",
        tech: "Industry News",
        salary: "Career Tips"
      };
      const expectedDbCategory = categoryMapping[selectedCategory];
      
      matchesCategory = (post.category && post.category === expectedDbCategory) || 
        postTags.some(tag => tag.toLowerCase() === selectedCategory || 
                              (selectedCategory === "cv" && tag.toLowerCase().includes("cv")) ||
                              (selectedCategory === "interview" && tag.toLowerCase().includes("phỏng vấn")) ||
                              (selectedCategory === "career" && tag.toLowerCase().includes("sự nghiệp")) ||
                              (selectedCategory === "tech" && tag.toLowerCase().includes("tech")) ||
                              (selectedCategory === "salary" && tag.toLowerCase().includes("lương"))
        );
    }

    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? postTags.some(tag => tag.toLowerCase() === selectedTag.replace('#', '').toLowerCase()) : true;

    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <div className="dark:bg-transparent bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Danh mục */}
          <aside className="lg:col-span-3 hidden lg:block">
            <CommunityLeftSidebar 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              topContributors={topContributors}
            />
          </aside>

          {/* Main Feed: Cột giữa lướt bảng tin */}
          <main className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-500 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 dark:bg-[#0a0f1c]/60 bg-white border dark:border-slate-800/80 border-gray-100/70 rounded-3xl shadow-xl shadow-gray-200/20 dark:text-slate-200 text-gray-700 focus:border-[#0ea5e9] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950/40 focus:outline-none transition-all placeholder-gray-400 font-medium"
              />
            </div>

            {/* CreatePostBox: Khung đăng bài nhanh giống Facebook */}
            <div className="dark:bg-[#0a0f1c]/60 bg-white rounded-3xl p-5 border dark:border-slate-800/80 border-gray-100/70 shadow-xl shadow-gray-200/25">
              <div className="flex items-center gap-4 pb-4 border-b dark:border-slate-850 border-gray-100/50">
                <div className="w-10.5 h-10.5 rounded-full overflow-hidden bg-[#0ea5e9] flex items-center justify-center border border-sky-100 shrink-0 text-white font-bold">
                  {isAuthenticated && user?.avatar_url ? (
                    <img src={user.avatar_url} alt="user avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0) || "👤"
                  )}
                </div>
                <button
                  onClick={handleWritePost}
                  className="flex-1 text-left px-5 py-3 rounded-2xl dark:bg-slate-900 bg-gray-50 dark:hover:bg-slate-850 hover:bg-gray-100 text-gray-400 dark:text-slate-500 font-medium transition-all text-sm outline-none cursor-pointer"
                >
                  {user ? `Bạn đang nghĩ gì thế, ${user.full_name}?` : "Bạn đang nghĩ gì thế? Đăng nhập để chia sẻ..."}
                </button>
              </div>

              {/* Hàng các nút thao tác nhanh */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-xs md:text-sm text-gray-500 dark:text-slate-400 font-bold">
                <button
                  onClick={handleWritePost}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl dark:hover:bg-slate-900/60 hover:bg-sky-50/50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                  <span>Ảnh bìa</span>
                </button>
                <button
                  onClick={handleWritePost}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl dark:hover:bg-slate-900/60 hover:bg-sky-50/50 transition-colors cursor-pointer"
                >
                  <Tag className="w-5 h-5 text-[#0ea5e9]" />
                  <span>Hashtags</span>
                </button>
                <button
                  onClick={handleWritePost}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl dark:hover:bg-slate-900/60 hover:bg-sky-50/50 transition-colors cursor-pointer"
                >
                  <Smile className="w-5 h-5 text-amber-500" />
                  <span>Cảm xúc</span>
                </button>
              </div>
            </div>

            {/* Bảng tin bài viết */}
            <div className="flex flex-col gap-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9]" />
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    {/* Nhãn bài viết đang chờ duyệt */}
                    {post.isPendingApproval && (
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>Đang chờ duyệt</span>
                      </div>
                    )}

                    <PostCard post={post} />
                  </div>
                ))
              ) : (
                <div className="dark:bg-[#0a0f1c]/60 bg-white rounded-3xl p-16 text-center border dark:border-slate-800/80 border-gray-100/70 shadow-xl shadow-gray-200/25">
                  <p className="dark:text-slate-400 text-gray-500 font-semibold text-lg">Không tìm thấy bài viết nào phù hợp.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar: Tiêu điểm */}
          <aside className="lg:col-span-3 hidden lg:block">
            <CommunityRightSidebar 
              trendingTags={trendingTags}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
          </aside>
        </div>
      </div>

      {/* QuickCreatePostModal: Modal đăng bài nhanh phong cách Facebook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="dark:bg-[#0a1122]/95 bg-white rounded-3xl w-full max-w-xl shadow-2xl border dark:border-slate-800/80 border-gray-100 overflow-hidden relative z-10 transition-transform duration-300 transform scale-100 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 border-b dark:border-slate-850 border-gray-100/80 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-slate-100 text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                <span>Tạo bài viết mới</span>
              </h3>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full dark:bg-slate-900 bg-gray-55/40 hover:dark:bg-slate-800 hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 dark:text-slate-500 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePublishPost} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              
              {/* User Identity Info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[#0ea5e9] flex items-center justify-center text-white text-base font-extrabold border border-sky-100">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0) || "👤"
                  )}
                </div>
                <div>
                  <div className="text-base font-extrabold dark:text-slate-200 text-gray-900 leading-tight">
                    {user?.full_name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#0ea5e9] dark:text-[#38bdf8] bg-sky-50 dark:bg-sky-950/45 px-2 py-0.5 rounded-md mt-1.5 uppercase tracking-wider w-fit">
                    <Globe className="w-3 h-3" />
                    <span>Bảng tin công khai</span>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  placeholder="Đặt một tiêu đề thu hút..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 rounded-2xl dark:bg-slate-900 bg-gray-50 border-none dark:text-slate-100 text-gray-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none transition-all text-sm font-semibold"
                />
              </div>

              {/* Content Textarea */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Nội dung chia sẻ
                </label>
                <textarea
                  placeholder={`${user?.full_name || "Bạn"} ơi, hãy chia sẻ kiến thức hoặc kinh nghiệm của mình nhé...`}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-5 py-4 rounded-2xl dark:bg-slate-900 bg-gray-50 border-none dark:text-slate-100 text-gray-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none transition-all text-sm font-medium resize-none"
                />
              </div>

              {/* Category & Tags Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Danh mục
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 rounded-2xl dark:bg-slate-900 bg-gray-50 border-none dark:text-slate-100 text-gray-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none transition-all text-sm font-semibold cursor-pointer"
                  >
                    <option value="cv">Mẹo Viết CV</option>
                    <option value="interview">Kinh Nghiệm Phỏng Vấn</option>
                    <option value="career">Lời Khuyên Sự Nghiệp</option>
                    <option value="tech">Xu Hướng Công Nghệ</option>
                    <option value="salary">Thông Tin Mức Lương</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Hashtags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="cv, phongvan, career..."
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 rounded-2xl dark:bg-slate-900 bg-gray-50 border-none dark:text-slate-100 text-gray-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Upload Cover Image Section */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Ảnh bìa bài đăng
                </label>
                
                {coverImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden h-48 border dark:border-slate-850 border-gray-100">
                    <img src={coverImagePreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed dark:border-slate-800 border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[#0ea5e9] dark:hover:border-[#38bdf8] transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-gray-400 group-hover:text-[#0ea5e9] transition-colors" />
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 group-hover:text-[#0ea5e9] transition-colors">
                      Chọn tệp hình ảnh để tải lên làm ảnh bìa
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t dark:border-slate-850 border-gray-100/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl border dark:border-slate-800 border-gray-100 hover:bg-gray-55 dark:hover:bg-slate-900 text-sm font-bold text-gray-500 dark:text-slate-400 cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold shadow-lg shadow-sky-100 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đăng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Đăng bài</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;
