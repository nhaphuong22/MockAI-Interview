import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Users, Building, TrendingUp, ArrowRight, Star, DollarSign } from "lucide-react";

const popularTags = ["IT", "Marketing", "Design", "Finance", "Sales", "Nhà Tuyển Dụng"];

const featuredJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    location: "Hà Nội",
    salary: "25-35 triệu",
    tags: ["React", "TypeScript", "Remote"],
    hot: true,
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Design Studio",
    logo: "🎨",
    location: "TP.HCM",
    salary: "20-30 triệu",
    tags: ["Figma", "Adobe XD", "UI Design"],
    hot: false,
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "E-Commerce Plus",
    logo: "📱",
    location: "Đà Nẵng",
    salary: "30-40 triệu",
    tags: ["Digital Marketing", "SEO", "SEM"],
    hot: true,
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Startup Hub",
    logo: "💻",
    location: "Remote",
    salary: "28-38 triệu",
    tags: ["Node.js", "React", "MongoDB"],
    hot: false,
  },
];

const stats = [
  { icon: Briefcase, value: "50,000+", label: "Việc Làm" },
  { icon: Building, value: "5,000+", label: "Công Ty" },
  { icon: Users, value: "200,000+", label: "Ứng Viên" },
  { icon: TrendingUp, value: "95%", label: "Hài Lòng" },
];

export function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-white via-[#f0f9ff] to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl mb-4">Tìm Việc Thông Minh Với AI</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI hỗ trợ tạo CV, luyện phỏng vấn, và kết nối nhà tuyển dụng phù hợp
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl md:w-64">
                <MapPin className="w-5 h-5 text-gray-400" />
                <select className="flex-1 bg-transparent outline-none">
                  <option>Tất cả thành phố</option>
                  <option>Hà Nội</option>
                  <option>TP.HCM</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>
              <Link
                to="/jobs"
                className="px-8 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Tìm Kiếm</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#f0f9ff] rounded-xl mb-3">
                    <Icon className="w-6 h-6 text-[#0ea5e9]" />
                  </div>
                  <div className="text-3xl mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl mb-2">Việc Làm Nổi Bật</h2>
              <p className="text-gray-600">Cơ hội việc làm tốt nhất dành cho bạn</p>
            </div>
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-[#0ea5e9] hover:gap-3 transition-all"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#0ea5e9] hover:shadow-lg transition-all cursor-pointer group"
              >
                {job.hot && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs mb-3">
                    <Star className="w-3 h-3 fill-current" />
                    <span>HOT</span>
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-[#0ea5e9] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0ea5e9] font-semibold mb-4">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#f0f9ff] text-[#0ea5e9] rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-2">Cách Thức Hoạt Động</h2>
            <p className="text-gray-600">3 bước đơn giản để tìm việc mơ ước</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl text-2xl mb-4">
                1
              </div>
              <h3 className="text-xl mb-2">Tạo CV</h3>
              <p className="text-gray-600">AI hỗ trợ tạo CV chuyên nghiệp, tối ưu ATS</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl text-2xl mb-4">
                2
              </div>
              <h3 className="text-xl mb-2">Phỏng Vấn AI</h3>
              <p className="text-gray-600">Luyện tập kỹ năng phỏng vấn với AI thông minh</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl text-2xl mb-4">
                3
              </div>
              <h3 className="text-xl mb-2">Kết Nối Công Ty</h3>
              <p className="text-gray-600">AI gợi ý công ty phù hợp với profile của bạn</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-4">Bắt đầu hành trình ngay hôm nay</h2>
          <p className="text-xl opacity-90 mb-8">
            Hơn 200,000 ứng viên đã tìm được công việc mơ ước với MockAI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-[#0ea5e9] rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Đăng Ký Miễn Phí
            </Link>
            <Link
              to="/jobs"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-[#0ea5e9] transition-all"
            >
              Khám Phá Việc Làm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
