import React, { useState } from "react";
import { Search } from "lucide-react";
import { CommunityLeftSidebar } from "./components/CommunityLeftSidebar";
import { CommunityRightSidebar } from "./components/CommunityRightSidebar";
import { PostCard } from "./components/PostCard";
import { WriteBlogModal } from "./components/WriteBlogModal";

const categories = [
  { id: "all", name: "Tất Cả Bài Viết", active: true },
  { id: "cv", name: "Mẹo Viết CV", active: false },
  { id: "interview", name: "Kinh Nghiệm Phỏng Vấn", active: false },
  { id: "career", name: "Lời Khuyên Sự Nghiệp", active: false },
  { id: "tech", name: "Xu Hướng Công Nghệ", active: false },
  { id: "salary", name: "Thông Tin Mức Lương", active: false },
];

const posts = [
  {
    id: 1,
    featured: true,
    title: "10 Mẹo Viết CV Chinh Phục Nhà Tuyển Dụng Tech",
    excerpt: "Hướng dẫn chi tiết cách tối ưu CV để vượt qua ATS và gây ấn tượng với recruiter tại các công ty công nghệ hàng đầu...",
    author: "Nguyễn Minh Anh",
    avatar: "👩‍💼",
    readTime: "8 phút đọc",
    likes: 245,
    comments: 32,
    tags: ["CV", "Tech", "Tips"],
    image: "📄",
  },
  {
    id: 2,
    featured: false,
    title: "Cách Trả Lời Câu Hỏi 'Điểm Yếu Của Bạn Là Gì?' Trong Phỏng Vấn",
    excerpt: "Đây là một trong những câu hỏi khó nhất trong phỏng vấn. Hãy cùng tìm hiểu cách trả lời thông minh...",
    author: "Trần Văn B",
    avatar: "👨‍💻",
    readTime: "5 phút đọc",
    likes: 189,
    comments: 24,
    tags: ["Phỏng vấn", "Mẹo"],
    image: "💼",
  },
  {
    id: 3,
    featured: false,
    title: "Xu Hướng Lương IT 2026: Các Ngôn Ngữ Và Framework Hot Nhất",
    excerpt: "Phân tích mức lương trung bình cho các vị trí IT phổ biến và những kỹ năng được trả lương cao nhất...",
    author: "Lê Thị C",
    avatar: "👩‍🔬",
    readTime: "12 phút đọc",
    likes: 567,
    comments: 89,
    tags: ["Lương", "Công nghệ", "Xu hướng"],
    image: "💰",
  },
  {
    id: 4,
    featured: false,
    title: "Chuyển Nghề Sang IT Ở Tuổi 30: Câu Chuyện Thành Công",
    excerpt: "Chia sẻ hành trình từ một nhân viên marketing chuyển sang làm developer và những bài học kinh nghiệm...",
    author: "Phạm Văn D",
    avatar: "👨‍🎓",
    readTime: "10 phút đọc",
    likes: 432,
    comments: 56,
    tags: ["Sự nghiệp", "Cảm hứng"],
    image: "🚀",
  },
];

const topContributors = [
  { name: "Nguyễn Minh Anh", posts: 45, avatar: "👩‍💼" },
  { name: "Trần Văn B", posts: 38, avatar: "👨‍💻" },
  { name: "Lê Thị C", posts: 32, avatar: "👩‍🔬" },
];

const trendingTags = ["#RemoteWork", "#AI", "#Startup", "#CareerGrowth", "#Networking", "#Interview"];

export function Community() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedPosts, setLikedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const toggleLike = (postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleWritePost = () => {
    setIsWriteModalOpen(true);
  };

  // Filter posts by category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || 
      post.tags.some(tag => tag.toLowerCase() === selectedCategory || 
                            (selectedCategory === "cv" && tag.toLowerCase() === "cv") ||
                            (selectedCategory === "interview" && tag.toLowerCase() === "phỏng vấn") ||
                            (selectedCategory === "career" && tag.toLowerCase() === "sự nghiệp") ||
                            (selectedCategory === "tech" && tag.toLowerCase() === "tech") ||
                            (selectedCategory === "salary" && tag.toLowerCase() === "lương")
      );

    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50/50 py-10">
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
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/30 focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id}
                    post={post}
                    isLiked={likedPosts.includes(post.id)}
                    onToggleLike={toggleLike}
                  />
                ))
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/30 border border-gray-50">
                  <p className="text-gray-500 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <CommunityRightSidebar 
              trendingTags={trendingTags}
              onWritePost={handleWritePost}
            />
          </aside>
        </div>
      </div>

      <WriteBlogModal 
        isOpen={isWriteModalOpen} 
        onOpenChange={setIsWriteModalOpen} 
      />
    </div>
  );
}
export default Community;
