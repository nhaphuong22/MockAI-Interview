import { Search, Heart, MessageCircle, Bookmark, PenSquare, TrendingUp, User, Eye } from "lucide-react";
import { useState } from "react";

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

  const toggleLike = (postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="bg-gray-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/20 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Danh Mục</h3>
              <div className="space-y-1.5">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                      selectedCategory === category.id
                        ? "bg-[#0ea5e9] text-white shadow-lg shadow-sky-100"
                        : "hover:bg-sky-50 text-gray-600 hover:text-[#0ea5e9]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Thành viên tích cực</h3>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                        {contributor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0ea5e9] transition-colors">{contributor.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{contributor.posts} bài viết</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, tác giả..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/30 focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/30 border border-gray-50 hover:border-sky-100 transition-all group ${
                    post.featured ? "ring-2 ring-sky-100" : ""
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
                        <div className="text-sm font-bold text-gray-900">{post.author}</div>
                        <div className="text-xs font-medium text-gray-500">{post.readTime}</div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#0ea5e9] cursor-pointer transition-colors leading-tight">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-sky-50 text-[#0ea5e9] rounded-lg text-[10px] font-bold uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-8">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-[#0ea5e9] transition-all group/btn"
                        >
                          <div className={`p-2 rounded-xl transition-colors ${likedPosts.includes(post.id) ? "bg-sky-50" : "group-hover/btn:bg-sky-50"}`}>
                            <Heart
                              className={`w-5 h-5 ${
                                likedPosts.includes(post.id)
                                  ? "fill-[#0ea5e9] text-[#0ea5e9]"
                                  : "group-hover/btn:scale-110"
                              }`}
                            />
                          </div>
                          <span className="font-bold text-sm">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-500 hover:text-[#0ea5e9] transition-all group/btn">
                          <div className="p-2 rounded-xl group-hover/btn:bg-sky-50 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{post.comments}</span>
                        </button>
                      </div>

                      <button className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-all">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl p-8 text-white shadow-xl shadow-sky-100 overflow-hidden relative group">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">Chia Sẻ Câu Chuyện</h3>
                <p className="text-sm opacity-90 mb-6 relative z-10 leading-relaxed font-medium">
                  Trở thành contributor và giúp đỡ 200,000+ thành viên trong cộng đồng
                </p>
                <button className="w-full py-4 bg-white text-[#0ea5e9] font-bold rounded-2xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 relative z-10 active:scale-[0.98]">
                  <PenSquare className="w-5 h-5" />
                  <span>Viết Bài Mới</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/20 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-gray-50 hover:bg-sky-50 text-gray-600 hover:text-[#0ea5e9] rounded-2xl text-xs font-bold transition-all border border-transparent hover:border-sky-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/20 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Tiêu điểm tuần</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-10 h-10 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all">
                        {i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-700 line-clamp-2 group-hover:text-[#0ea5e9] transition-colors leading-snug">
                          Cách Đàm Phán Lương Hiệu Quả Cho Vị Trí Senior {i}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1 uppercase tracking-wider">
                          <Eye className="w-3 h-3" /> 2.4k lượt đọc
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
