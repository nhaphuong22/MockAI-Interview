import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Users, Building, TrendingUp, ArrowRight, Star, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { AuroraBackground } from "../../components/ui/AuroraBackground";
import { ShinyText } from "../../components/ui/ShinyText";
import { useThemeStore } from "../../store/useThemeStore";

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
  const { theme } = useThemeStore();
  
  return (
    <div className="dark:bg-[#0a0f1c] bg-slate-50 transition-colors duration-500">
      {/* Hero Section with Aurora Background */}
      <AuroraBackground className="min-h-[90vh] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-sm">
              <ShinyText 
                text="Tìm Việc Thông Minh" 
                textColor={theme === 'dark' ? '#ffffff' : '#060606'}
                shineColor="#33B9F5" 
                speed={3}
                spread={20}
              />
              <br className="hidden md:block" />
              <ShinyText 
                text="Với" 
                textColor={theme === 'dark' ? '#ffffff' : '#060606'}
                shineColor="#33B9F5" 
                speed={2}
                spread={20}
                className="mr-3 md:mr-4"
              />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] inline-block">AI</span>
            </h1>
            <p className="text-lg md:text-xl dark:text-slate-300 text-slate-600 max-w-2xl mx-auto font-light">
              AI hỗ trợ tạo CV, luyện phỏng vấn, và kết nối nhà tuyển dụng phù hợp
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto mb-8"
          >
            {/* Glassmorphic Search Box */}
            <div className="dark:bg-[#0f172a]/80 bg-white/60 backdrop-blur-xl border dark:border-white/10 border-white/40 shadow-[0_8px_32px_rgba(14,165,233,0.1)] rounded-3xl p-3 flex flex-col md:flex-row gap-3 transition-all hover:shadow-[0_8px_32px_rgba(14,165,233,0.15)]">
              <div className="flex-1 flex items-center gap-3 px-5 py-3 dark:bg-[#1e293b]/50 bg-white/50 backdrop-blur-md rounded-2xl border dark:border-white/5 border-white/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 focus-within:border-[#0ea5e9]/30 transition-all">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:text-white text-slate-700"
                />
              </div>
              <div className="flex items-center gap-3 px-5 py-3 dark:bg-[#1e293b]/50 bg-white/50 backdrop-blur-md rounded-2xl border dark:border-white/5 border-white/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 transition-all md:w-64">
                <MapPin className="w-5 h-5 text-slate-400" />
                <select className="flex-1 bg-transparent outline-none dark:text-white text-slate-600 cursor-pointer dark:bg-[#1e293b] bg-transparent">
                  <option>Tất cả thành phố</option>
                  <option>Hà Nội</option>
                  <option>TP.HCM</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>
              <Link
                to="/jobs"
                className="px-8 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl hover:shadow-[0_8px_20px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <Search className="w-5 h-5" />
                <span>Tìm Kiếm</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {popularTags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
                  className="px-4 py-1.5 dark:bg-white/5 bg-white/40 backdrop-blur-md border dark:border-white/10 border-white/50 rounded-full text-sm dark:text-slate-300 text-slate-600 hover:border-[#0ea5e9]/50 dark:hover:bg-[#0ea5e9]/20 hover:bg-[#f0f9ff]/80 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-all"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* Stats Section with Glass Cards */}
      <section className="py-12 dark:bg-[#0a0f1c]/80 bg-white/80 border-y dark:border-white/10 border-slate-200/50 backdrop-blur-sm relative z-20 -mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  key={index} 
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 dark:bg-[#0f172a] bg-sky-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border dark:border-white/5 border-transparent">
                    <Icon className="w-6 h-6 text-[#0ea5e9]" />
                  </div>
                  <div className="text-3xl font-bold mb-1 dark:text-white text-slate-800">{stat.value}</div>
                  <div className="dark:text-slate-400 text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section (Shadcn Style) */}
      <section className="py-24 dark:bg-[#0a0f1c] bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 dark:text-white text-slate-900 tracking-tight">Việc Làm Nổi Bật</h2>
              <p className="dark:text-slate-400 text-slate-500">Cơ hội việc làm tốt nhất dành cho bạn</p>
            </div>
            <Link
              to="/jobs"
              className="hidden md:flex items-center gap-2 text-[#0ea5e9] font-medium hover:gap-3 transition-all"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.map((job, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                key={job.id}
                className="dark:bg-[#0f172a] bg-white rounded-2xl p-6 border dark:border-white/10 border-slate-200/60 hover:border-[#0ea5e9]/30 dark:hover:border-[#0ea5e9]/50 hover:shadow-[0_8px_30px_rgb(14,165,233,0.12)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {job.hot && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold tracking-wide mb-4 uppercase">
                    <Star className="w-3 h-3 fill-current" />
                    <span>HOT</span>
                  </div>
                )}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 dark:bg-gradient-to-br dark:from-[#1e293b] dark:to-[#0f172a] bg-gradient-to-br from-sky-50 to-white border dark:border-white/5 border-sky-100 shadow-sm rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    {job.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white text-slate-900 mb-1 group-hover:text-[#0ea5e9] transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm dark:text-slate-400 text-slate-500 line-clamp-1">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0ea5e9] font-bold mb-5">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 dark:bg-slate-800/80 bg-slate-100/80 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          <Link
            to="/jobs"
            className="md:hidden mt-8 flex items-center justify-center gap-2 text-[#0ea5e9] font-medium hover:gap-3 transition-all"
          >
            <span>Xem tất cả việc làm</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 dark:bg-[#0a0f1c] bg-white relative overflow-hidden transition-colors">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl dark:from-sky-900/10 from-sky-50/50 to-transparent pointer-events-none rounded-bl-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-white text-slate-900">Cách Thức Hoạt Động</h2>
            <p className="dark:text-slate-400 text-slate-500 max-w-2xl mx-auto">3 bước đơn giản để tìm việc mơ ước với sức mạnh của Trí tuệ nhân tạo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16.666667%] right-[16.666667%] h-0.5 bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 -z-10" />

            {[
              { num: "1", title: "Tạo CV Thông Minh", desc: "AI hỗ trợ tạo và tối ưu CV chuẩn ATS, phân tích điểm mạnh điểm yếu dựa trên JD." },
              { num: "2", title: "Phỏng Vấn Giả Lập AI", desc: "Luyện tập phỏng vấn với AI thông minh qua giọng nói, nhận feedback chi tiết ngay lập tức." },
              { num: "3", title: "Kết Nối Chính Xác", desc: "Hệ thống tự động match hồ sơ của bạn với các vị trí tuyển dụng phù hợp nhất." }
            ].map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                key={i} 
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 dark:bg-[#0f172a] bg-white border dark:border-white/10 border-sky-100 shadow-[0_8px_30px_rgb(14,165,233,0.1)] rounded-3xl text-3xl font-bold text-[#0ea5e9] mb-6 group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgb(14,165,233,0.2)] transition-all duration-300">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white text-slate-900">{step.title}</h3>
                <p className="dark:text-slate-400 text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        {/* Glow effects for dark background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0ea5e9]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Bắt đầu hành trình ngay hôm nay</h2>
            <p className="text-xl text-slate-300 mb-10 font-light">
              Hơn 200,000 ứng viên đã tìm được công việc mơ ước với MockAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300"
              >
                Đăng Ký Miễn Phí
              </Link>
              <Link
                to="/jobs"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 text-white font-semibold rounded-2xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
              >
                Khám Phá Việc Làm
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
