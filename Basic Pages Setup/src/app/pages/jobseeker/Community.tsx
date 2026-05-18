import { Search, Heart, MessageCircle, Bookmark, PenSquare, TrendingUp, User } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: "all", name: "All Posts", active: true },
  { id: "cv", name: "CV Tips", active: false },
  { id: "interview", name: "Interview Prep", active: false },
  { id: "career", name: "Career Advice", active: false },
  { id: "tech", name: "Tech Trends", active: false },
  { id: "salary", name: "Salary Insights", active: false },
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
    tags: ["Interview", "Tips"],
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
    tags: ["Salary", "Tech", "Trends"],
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
    tags: ["Career", "Inspiration"],
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
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-semibold mb-4">Danh Mục</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-[#E8580C] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-4">Top Contributors</h3>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-full flex items-center justify-center text-lg">
                        {contributor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{contributor.name}</div>
                        <div className="text-xs text-gray-600">{contributor.posts} bài viết</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100 hover:border-[#E8580C] transition-all ${
                    post.featured ? "border-[#E8580C]" : ""
                  }`}
                >
                  {post.featured && (
                    <div className="bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] px-4 py-2">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Bài Viết Nổi Bật</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex gap-6">
                      {post.featured && (
                        <div className="hidden sm:block w-48 h-32 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-xl flex-shrink-0 flex items-center justify-center text-6xl">
                          {post.image}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-full flex items-center justify-center">
                            {post.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{post.author}</div>
                            <div className="text-xs text-gray-600">{post.readTime}</div>
                          </div>
                        </div>

                        <h2 className="text-xl font-semibold mb-2 hover:text-[#E8580C] cursor-pointer transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-[#FFF3ED] text-[#E8580C] rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#E8580C] transition-colors group"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                likedPosts.includes(post.id)
                                  ? "fill-[#E8580C] text-[#E8580C]"
                                  : "group-hover:scale-110 transition-transform"
                              }`}
                            />
                            <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                          </button>

                          <button className="flex items-center gap-2 text-gray-600 hover:text-[#E8580C] transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </button>

                          <button className="flex items-center gap-2 text-gray-600 hover:text-[#E8580C] transition-colors ml-auto">
                            <Bookmark className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl mb-2">Chia Sẻ Câu Chuyện</h3>
                <p className="text-sm opacity-90 mb-4">
                  Trở thành contributor và giúp đỡ cộng đồng
                </p>
                <button className="w-full py-3 bg-white text-[#E8580C] rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <PenSquare className="w-5 h-5" />
                  <span>Viết Bài Mới</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-4">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#FFF3ED] hover:text-[#E8580C] rounded-full text-sm transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-4">Weekly Top Articles</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-[#FFF3ED] text-[#E8580C] rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                        {i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 hover:text-[#E8580C] cursor-pointer transition-colors">
                          Cách Đàm Phán Lương Hiệu Quả {i}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">2.4k lượt đọc</p>
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
