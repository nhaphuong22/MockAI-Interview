import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { blogApi } from "../../api/blogApi";
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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleLike = (postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleWritePost = () => {
    navigate('/community/write');
  };

  const { data: blogResponse, isLoading } = useQuery({
    queryKey: ["publishedBlogs"],
    queryFn: async () => {
      try {
        const res = await blogApi.getPublishedBlogs();
        console.log("API Response:", res);
        if (Array.isArray(res)) return res;
        return res.data || [];
      } catch (err) {
        console.error("API Error:", err);
        return [];
      }
    }
  });

  const apiPosts = blogResponse || [];

  const formattedPosts = apiPosts.map(post => {
    // Generate an excerpt from content
    const stripHtml = (html) => {
      if (!html) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
    const plainText = stripHtml(post.content);
    
    // Convert tags if it's string (e.g. from pg array)
    const tagsArray = Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.replace(/[{}]/g, '').split(',') : []);

    return {
      id: post.id,
      featured: post.view_count > 100, 
      title: post.title,
      excerpt: plainText.substring(0, 150) + "...",
      author: post.author_name || "Tác giả",
      avatar: post.author_avatar ? (
        <img src={post.author_avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
      ) : (
        "✍️"
      ),
      readTime: Math.max(1, Math.ceil(plainText.length / 1000)) + " phút đọc",
      likes: post.view_count,
      comments: 0,
      tags: tagsArray.filter(t => t),
      image: post.cover_image_url || "📄",
    };
  });

  // Filter posts by category and search query
  const filteredPosts = formattedPosts.filter(post => {
    const postTags = post.tags || [];
    const matchesCategory = selectedCategory === "all" || 
      postTags.some(tag => tag.toLowerCase() === selectedCategory || 
                            (selectedCategory === "cv" && tag.toLowerCase() === "cv") ||
                            (selectedCategory === "interview" && tag.toLowerCase() === "phỏng vấn") ||
                            (selectedCategory === "career" && tag.toLowerCase() === "sự nghiệp") ||
                            (selectedCategory === "tech" && tag.toLowerCase() === "tech") ||
                            (selectedCategory === "salary" && tag.toLowerCase() === "lương")
      );

    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? postTags.some(tag => tag.toLowerCase() === selectedTag.replace('#', '').toLowerCase()) : true;

    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <div className="dark:bg-transparent bg-gray-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <CommunityLeftSidebar 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              topContributors={topContributors}
            />
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-500 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 dark:bg-[#0a0f1c]/50 bg-white border dark:border-white/10 border-gray-100 rounded-3xl shadow-xl shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 dark:text-slate-300 text-gray-700 focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post.id} onClick={() => navigate(`/community/post/${post.id}`)} className="cursor-pointer">
                    <PostCard 
                      post={post}
                      isLiked={likedPosts.includes(post.id)}
                      onToggleLike={(e) => {
                        e.stopPropagation();
                        toggleLike(post.id);
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
                  <p className="dark:text-slate-400 text-gray-500 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <CommunityRightSidebar 
              trendingTags={trendingTags}
              onWritePost={handleWritePost}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
export default Community;
