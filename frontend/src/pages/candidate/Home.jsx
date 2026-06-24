import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, MapPin, Briefcase, Users, User, Building, TrendingUp, ArrowRight, 
  Star, DollarSign, CheckCircle, Clock, ArrowUpRight, Activity, FileText, 
  Settings, Award, Sparkles, ExternalLink, ChevronRight, Bookmark, 
  Crown, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AuroraBackground } from "../../components/ui/AuroraBackground";
import { ShinyText } from "../../components/ui/ShinyText";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useUiStore } from "../../store/useUiStore";
import { jobApi } from "../../api/jobApi";
import { JobCard } from "./components/JobCard";
import { getRelativeTimeString } from "../../utils/dateUtils";

const CITY_OPTIONS = [
  "Thành phố Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Thành phố Hải Phòng",
  "Thành phố Đà Nẵng",
  "Thành phố Cần Thơ",
  "Thành phố Huế",
  "Tỉnh Cao Bằng",
  "Tỉnh Điện Biên",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Lai Châu",
  "Tỉnh Lạng Sơn",
  "Tỉnh Nghệ An",
  "Tỉnh Quảng Ninh",
  "Tỉnh Thanh Hóa",
  "Tỉnh Sơn La",
  "Tỉnh Tuyên Quang",
  "Tỉnh Lào Cai",
  "Tỉnh Thái Nguyên",
  "Tỉnh Phú Thọ",
  "Tỉnh Bắc Ninh",
  "Tỉnh Hưng Yên",
  "Tỉnh Ninh Bình",
  "Tỉnh Quảng Trị",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Gia Lai",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lâm Đồng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Đồng Nai",
  "Tỉnh Tây Ninh",
  "Tỉnh Vĩnh Long",
  "Tỉnh Đồng Tháp",
  "Tỉnh Cà Mau",
  "Tỉnh An Giang"
].sort((a, b) => a.localeCompare(b, 'vi'));

const popularTags = ["IT", "Marketing", "Design", "Finance", "Sales", "Nhà Tuyển Dụng"];



export function Home() {
  const { theme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);

  // Fetch provinces from API
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
        if (response.ok && isMounted) {
          const data = await response.json();
          const sortedProvinces = data.map(p => p.name).sort((a, b) => a.localeCompare(b, 'vi'));
          setProvinces(sortedProvinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces from API v2 in Home:", error);
      }
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Redirect HR and Admin role to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toUpperCase();
      if (role === "HR") {
        navigate("/hr/dashboard", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Always render Landing Page, even if authenticated
  return (
    <RenderLandingPage 
      theme={theme} 
      provinces={provinces} 
      popularTags={popularTags}
      isAuthenticated={isAuthenticated}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────────

// PUBLIC LANDING PAGE VIEW (WHEN LOGGED OUT)
// ────────────────────────────────────────────────────────────────────────────────
function RenderLandingPage({ theme, provinces, popularTags, isAuthenticated }) {
  const { showToast } = useUiStore();
  const navigate = useNavigate();
  const [searchWord, setSearchWord] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const bookmarkedJobs = [];

  const handleProtectedAction = (e, path) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAuthenticated && path) {
      navigate(path);
    } else if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để dùng được tính năng này", type: "warning" });
    }
  };

  // Fetch jobs thực tế từ API
  const { data: responseJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["landing-page-jobs"],
    queryFn: () => jobApi.getJobs({ status: "OPEN" }),
  });
  const jobsList = responseJobs?.data?.items || [];

  // Helper định dạng lương
  const formatSalary = (min, max, currency, visible) => {
    if (!visible) return "Thương lượng";
    if (!min && !max) return "Thương lượng";
    const formatNumber = (num) => {
      if (!num) return "";
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
      return num.toLocaleString("vi-VN");
    };
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    if (min) return `Từ ${formatNumber(min)} ${currency}`;
    return `Lên đến ${formatNumber(max)} ${currency}`;
  };

  // Định dạng lại các job từ API
  const formattedJobs = jobsList.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company_name || "Công ty chưa xác minh",
    logo: job.company_logo || job.company_name?.substring(0, 1).toUpperCase() || "J",
    location: job.company_address || "Việt Nam",
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible),
    type: job.experience_level || "Không yêu cầu", 
    remote: job.vacancy_count ? `${job.vacancy_count} chỉ tiêu` : "1 chỉ tiêu",
    experience: job.experience_level || "Không yêu cầu",
    tags: job.requirements ? job.requirements.split(",").slice(0, 3).map(t => t.trim()) : ["Tuyển dụng"],
    aiMatch: job.aiMatch || (82 + (job.id % 14)), // Simulated Match
    posted: getRelativeTimeString(job.created_at),
    applicants: job.applicants_count || 0,
    description: job.description,
    requirements: job.requirements,
  }));

  const displayJobs = formattedJobs.slice(0, 6);

  const toggleBookmark = (e) => {
    handleProtectedAction(e);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/jobs", { state: { search: searchWord, location: searchLocation } });
  };

  return (
    <div className="dark:bg-[#0a0f1c] bg-slate-50 transition-colors duration-500 min-h-screen pb-16">
      {/* Hero Section with Aurora Background */}
      <AuroraBackground className="min-h-[340px] lg:min-h-[400px] flex flex-col justify-center items-center pt-24 pb-8 md:pt-28 lg:pt-32 lg:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight drop-shadow-sm">
              <ShinyText 
                text="Tìm Việc Thông Minh" 
                textColor={theme === 'dark' ? '#ffffff' : '#060606'}
                shineColor="#33B9F5" 
                speed={3}
                spread={20}
              />
              <br className="hidden md:block" />
              <ShinyText 
                text="Với Sức Mạnh" 
                textColor={theme === 'dark' ? '#ffffff' : '#060606'}
                shineColor="#33B9F5" 
                speed={2}
                spread={20}
                className="mr-3 md:mr-4"
              />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] inline-block font-extrabold">Trí Tuệ Nhân Tạo AI</span>
            </h1>
            <p className="text-sm md:text-base dark:text-slate-300 text-slate-600 max-w-2xl mx-auto font-light">
              Tạo CV chuẩn ATS, luyện phỏng vấn giả lập với AI và kết nối nhà tuyển dụng hàng đầu
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {/* Glassmorphic Search Box */}
            <div className="dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl p-3 flex flex-col md:flex-row gap-3 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 dark:bg-[#1e293b]/50 bg-slate-50/50 rounded-xl border border-gray-200/50 dark:border-white/5 focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Vị trí, kỹ năng, công ty..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:text-white text-slate-700 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 dark:bg-[#1e293b]/50 bg-slate-50/50 rounded-xl border border-gray-200/50 dark:border-white/5 focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 transition-all md:w-60">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="flex-1 bg-transparent outline-none dark:text-white text-slate-600 text-sm cursor-pointer dark:bg-[#1e293b]"
                >
                  <option value="">Tất cả địa điểm</option>
                  {(provinces && provinces.length > 0 ? provinces : CITY_OPTIONS).map((city) => (
                    <option key={city} value={city} className="dark:bg-[#1e293b] dark:text-white text-slate-700">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-[0_4px_15px_rgba(14,165,233,0.3)] transition-all font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Việc</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/jobs", { state: { search: tag } });
                  }}
                  className="px-3.5 py-1.5 dark:bg-white/5 bg-white/40 backdrop-blur-md border dark:border-white/10 border-white/50 rounded-full text-xs dark:text-slate-300 text-slate-600 hover:border-[#0ea5e9]/50 dark:hover:bg-[#0ea5e9]/20 hover:bg-[#f0f9ff]/80 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-all cursor-pointer font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* Main Grid Content - 2-Column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (8/12 - MAIN CONTENT) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Featured Jobs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <h3 className="pb-2 text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
                  Việc làm tuyển dụng nổi bật
                </h3>
                <button 
                  onClick={() => navigate("/jobs")}
                  className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer bg-transparent border-none"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {jobsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-32 bg-gray-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : displayJobs.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-center col-span-full">
                  <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Hiện tại chưa có việc làm tuyển dụng nào.</p>
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {displayJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <JobCard
                          job={job}
                          isSelected={false}
                          isBookmarked={bookmarkedJobs.includes(job.id)}
                          onSelect={() => navigate(`/jobs/${job.id}`)}
                          onToggleBookmark={toggleBookmark}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* AI CV Scanner Feature Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-3xl shrink-0 text-emerald-500 shadow-sm border border-emerald-100/55 dark:border-emerald-500/20">
                📄
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h4 className="font-bold text-base dark:text-white text-gray-900">Phân tích CV & Chấm điểm ATS tự động</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  Tải CV của bạn lên để hệ thống AI phân tích độ tương thích với các vị trí tuyển dụng, đề xuất chỉnh sửa chuẩn ATS và chấm điểm năng lực tức thì.
                </p>
              </div>
              <button
                onClick={(e) => handleProtectedAction(e, "/cv-review")}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all cursor-pointer whitespace-nowrap"
              >
                Trải nghiệm ATS
              </button>
            </motion.div>

            {/* AI 3D Interview Feature Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/20 flex items-center justify-center text-3xl shrink-0 text-[#0ea5e9] shadow-sm border border-sky-100/55 dark:border-sky-500/20">
                🤖
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h4 className="font-bold text-base dark:text-white text-gray-900">Phòng phỏng vấn ảo AI 3D cao cấp</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  Luyện tập trả lời phỏng vấn trực tiếp bằng giọng nói với AI ảo 3D sinh động, nhận nhận xét điểm mạnh điểm yếu và báo cáo phân tích chi tiết.
                </p>
              </div>
              <button
                onClick={(e) => handleProtectedAction(e, "/interview-practice")}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white text-xs font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(14,165,233,0.2)] transition-all cursor-pointer whitespace-nowrap"
              >
                Phỏng vấn ngay
              </button>
            </motion.div>

          </div>

          {/* RIGHT COLUMN (4/12 - SIDEBAR WIDGETS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Auth Invitation Card (Sidebar Welcome) */}
            {!isAuthenticated && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden"
              >
                {/* Glow decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-md animate-pulse">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm dark:text-white text-gray-900 leading-snug">Chào mừng bạn tới MockAI-Interview!</h4>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                    Đăng nhập để cập nhật hồ sơ năng lực, tạo CV chuyên nghiệp chuẩn ATS và tham gia phỏng vấn giọng nói giả lập với AI ảo.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => useUiStore.getState().openAuthModal({ mode: 'login' })}
                      className="w-full py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white text-xs font-bold rounded-xl hover:shadow-[0_4px_15px_rgba(14,165,233,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Đăng nhập ngay</span>
                    </button>
                    
                    <button
                      onClick={() => useUiStore.getState().openAuthModal({ mode: 'register' })}
                      className="w-full py-2.5 border border-sky-100 dark:border-sky-950 text-xs font-bold text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 transition-all flex items-center justify-center bg-gradient-to-r from-sky-50 to-white dark:from-slate-900/60 dark:to-slate-800/60 shadow-sm cursor-pointer"
                    >
                      <span>Đăng ký tài khoản</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Links Menu */}
            <div className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-4">
              <h4 className="font-bold text-sm dark:text-white text-gray-900 border-b dark:border-white/5 pb-2">Liên kết nhanh</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => handleProtectedAction(e, "/interview-practice")}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 text-[#0ea5e9] mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Luyện phỏng vấn</span>
                </button>
                <button 
                  onClick={(e) => handleProtectedAction(e, "/cv-review")}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-emerald-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Quản lý CV</span>
                </button>
                <button 
                  onClick={(e) => handleProtectedAction(e, "/saved-jobs")}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Bookmark className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Công việc đã lưu</span>
                </button>
                <button 
                  onClick={(e) => handleProtectedAction(e, "/settings")}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Settings className="w-5 h-5 text-gray-500 dark:text-slate-400 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Cài đặt tài khoản</span>
                </button>
              </div>
            </div>

            {/* AI 3D Interview Prep Teaser Card */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-slate-950 border border-white/5 shadow-xl group text-white cursor-pointer"
              onClick={(e) => handleProtectedAction(e, "/interview-practice")}
            >
              {/* Fluid gradients background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/25 rounded-full blur-[50px] group-hover:bg-[#0ea5e9]/35 transition-colors" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#38bdf8]/10 rounded-full blur-[40px]" />
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-2 bg-[#0ea5e9]/10 rounded-xl border border-sky-500/20 text-[#0ea5e9]">
                  <Sparkles className="w-5 h-5 text-[#0ea5e9] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide uppercase text-sky-400">AI 3D Interview Prep</h4>
                  <h3 className="text-lg font-extrabold leading-tight mt-1.5">Luyện tập phỏng vấn ảo với Trí tuệ nhân tạo</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 font-medium">
                    Trò chuyện thoại trực tiếp với avatar AI ảo 3D sinh động, nhận nhận xét điểm mạnh điểm yếu và điểm số chi tiết chuẩn ATS.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[#0ea5e9] text-xs font-bold group-hover:gap-2.5 transition-all">
                  <span>Trải nghiệm phòng ảo 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
