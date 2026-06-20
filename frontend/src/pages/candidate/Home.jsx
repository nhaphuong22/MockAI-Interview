import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, MapPin, Briefcase, Users, User, Building, TrendingUp, ArrowRight, 
  Star, DollarSign, CheckCircle, Clock, ArrowUpRight, Activity, FileText, 
  Settings, Award, Sparkles, ExternalLink, ChevronRight, Bookmark, 
  Crown, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuroraBackground } from "../../components/ui/AuroraBackground";
import { ShinyText } from "../../components/ui/ShinyText";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useUiStore } from "../../store/useUiStore";
import { jobApi } from "../../api/jobApi";
import { applicationApi } from "../../api/applicationApi";
import { getInterviewHistoryApi } from "../../api/interviewApi";
import { getProfileApi, updateProfileApi } from "../../api/auth";
import { JobCard } from "./components/JobCard";

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
  const { showToast } = useUiStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Render original Landing Page when user is not authenticated
  if (!isAuthenticated) {
    return (
      <RenderLandingPage 
        theme={theme} 
        provinces={provinces} 
        popularTags={popularTags} 
      />
    );
  }

  // Render Candidate Dashboard when user is authenticated
  return (
    <RenderCandidateDashboard 
      provinces={provinces}
      showToast={showToast}
      queryClient={queryClient}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// CANDIDATE DASHBOARD VIEW (WHEN LOGGED IN)
// ────────────────────────────────────────────────────────────────────────────────
function RenderCandidateDashboard({ provinces, showToast, queryClient }) {
  const navigate = useNavigate();
  const [searchWord, setSearchWord] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  // 1. Fetch Candidate profile from database
  const { data: profile } = useQuery({
    queryKey: ['userProfileHome'],
    queryFn: async () => {
      const res = await getProfileApi();
      return res?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch jobs list from API
  const { data: responseJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["candidate-dashboard-jobs"],
    queryFn: () => jobApi.getJobs({ status: "OPEN" }),
  });
  const jobsList = responseJobs?.data?.items || [];

  // 3. Fetch applications history
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["candidate-dashboard-applications"],
    queryFn: () => applicationApi.getApplications(),
  });
  const applicationsData = Array.isArray(applications) ? applications : (applications?.data || []);
  const recentApps = (applicationsData || []).slice(0, 3);

  // 4. Fetch AI interview history
  const { data: interviewHistory, isLoading: interviewsLoading } = useQuery({
    queryKey: ["candidate-dashboard-interviews"],
    queryFn: () => getInterviewHistoryApi(),
  });
  const interviewHistoryData = Array.isArray(interviewHistory) ? interviewHistory : (interviewHistory?.data || []);
  const recentInterviews = (interviewHistoryData || []).slice(0, 3);

  // 5. Update Profile Mutation for Job Seeking Status
  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateProfileApi(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['userProfileHome'], updatedUser?.data);
      queryClient.setQueryData(['userProfile'], updatedUser?.data);
      showToast({ message: "Cập nhật trạng thái tìm việc thành công!", type: "success" });
    },
    onError: (error) => {
      console.error("Lỗi cập nhật trạng thái tìm việc:", error);
      showToast({ message: "Lỗi kết nối hệ thống. Vui lòng thử lại sau.", type: "error" });
    }
  });

  const handleToggleJobSeeking = () => {
    const currentStatus = profile?.is_looking_for_job !== false; // default true
    updateProfileMutation.mutate({ isLookingForJob: !currentStatus });
  };

  const toggleBookmark = (jobId) => {
    setBookmarkedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // 6. Format Salary Helper
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

  // 7. Process & Format Jobs Data
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
    posted: job.created_at ? new Date(job.created_at).toLocaleDateString("vi-VN") : "Gần đây",
    applicants: job.applicants_count || 0,
    description: job.description,
    requirements: job.requirements,
  }));

  // AI Matching logic using candidate profile skills
  const candidateSkills = profile?.skills || [];
  const suitableJobs = formattedJobs.filter(job => {
    if (candidateSkills.length === 0) return true;
    const reqText = (job.requirements || "").toLowerCase();
    const titleText = (job.title || "").toLowerCase();
    return candidateSkills.some(skill => 
      reqText.includes(skill.toLowerCase()) || titleText.includes(skill.toLowerCase())
    );
  });

  const displaySuitableJobs = suitableJobs.length > 0 ? suitableJobs.slice(0, 6) : formattedJobs.slice(0, 6);



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/jobs", { state: { search: searchWord, location: searchLocation } });
  };

  const getStatusBadge = (status) => {
    const norm = status?.toLowerCase();
    if (norm === "accepted") {
      return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full text-xs font-semibold">Được nhận</span>;
    }
    if (norm === "rejected") {
      return <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 rounded-full text-xs font-semibold">Từ chối</span>;
    }
    if (norm === "reviewing") {
      return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 rounded-full text-xs font-semibold">Đang xem xét</span>;
    }
    return <span className="px-2.5 py-0.5 bg-sky-50 text-[#0ea5e9] dark:bg-sky-950/30 dark:text-sky-400 rounded-full text-xs font-semibold">Mới tiếp nhận</span>;
  };

  const rawAvatar = profile?.avatar_url || profile?.avatarUrl || localStorage.getItem("googleAvatar") || "";
  const getAbsoluteAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const userAvatar = rawAvatar.includes("googleusercontent.com")
    ? rawAvatar.replace(/=s\d+(-c)?$/, "=s384-c")
    : getAbsoluteAvatarUrl(rawAvatar);
  const packageName = profile?.package_name || "MIỄN PHÍ";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
      
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8/12 - MAIN CONTENT) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Mini Search Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
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
                  {provinces.map((city) => (
                    <option key={city} value={city} className="dark:bg-[#1e293b] dark:text-white text-slate-700">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-[0_4px_15px_rgba(14,165,233,0.3)] transition-all font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Việc</span>
              </button>
            </form>
          </motion.div>

          {/* Job Suggestions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
              <h3 className="pb-2 text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
                Việc làm phù hợp với bạn
              </h3>
              <Link to="/jobs" className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 hover:gap-2 transition-all">
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-32 bg-gray-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {displaySuitableJobs.map((job) => (
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

          {/* Recent Applications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white text-gray-900">Lịch sử ứng tuyển gần đây</h3>
              <Link to="/applications" className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 hover:gap-2 transition-all">
                <span>Quản lý hồ sơ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {appsLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-16 bg-gray-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentApps.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-center">
                <FileText className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">Bạn chưa ứng tuyển công việc nào gần đây.</p>
                <Link to="/jobs" className="text-xs text-[#0ea5e9] font-bold mt-2 inline-block hover:underline">
                  Tìm việc và nộp đơn ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApps.map((app) => (
                  <div 
                    key={app.id}
                    className="p-4 dark:bg-[#0f172a]/40 bg-white border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-[#0ea5e9]/20 transition-all cursor-pointer"
                    onClick={() => navigate("/applications")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/20 rounded-xl flex items-center justify-center text-lg shadow-sm">
                        💼
                      </div>
                      <div>
                        <h4 className="text-sm font-bold dark:text-white text-gray-900 line-clamp-1">{app.jobTitle}</h4>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">{app.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400 font-medium">Nộp ngày</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-slate-300 mt-0.5">
                          {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString("vi-VN") : "Gần đây"}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent AI Interviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white text-gray-900">Lịch sử luyện phỏng vấn AI</h3>
              <Link to="/interview-practice" className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 hover:gap-2 transition-all">
                <span>Vào phòng phỏng vấn</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {interviewsLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-16 bg-gray-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-center">
                <Activity className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">Chưa có lịch sử luyện tập phỏng vấn ảo.</p>
                <Link to="/interview-practice" className="text-xs text-[#0ea5e9] font-bold mt-2 inline-block hover:underline">
                  Bắt đầu buổi phỏng vấn giả lập
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInterviews.map((iv) => (
                  <div 
                    key={iv.id}
                    className="p-4 dark:bg-[#0f172a]/40 bg-white border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-[#0ea5e9]/20 transition-all cursor-pointer"
                    onClick={() => {
                      if (iv.type === "REAL") {
                        navigate(`/hr-interview/result/${iv.id}`);
                      } else {
                        navigate("/interview-practice", { state: { viewSessionId: iv.id } });
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/20 rounded-xl flex items-center justify-center text-lg shadow-sm">
                        🤖
                      </div>
                      <div>
                        <h4 className="text-sm font-bold dark:text-white text-gray-900 line-clamp-1">
                          {iv.position || "Phỏng vấn giả lập"}
                        </h4>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">
                          {iv.type === "REAL" ? "Ứng tuyển thực tế" : "Tự luyện tập phỏng vấn"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400 font-medium">Thời gian</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-slate-300 mt-0.5">
                          {iv.date ? new Date(iv.date).toLocaleDateString("vi-VN") : "Gần đây"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-xl text-xs font-bold border border-sky-100/50 dark:border-sky-500/20">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{iv.overall_score ?? 80} điểm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (4/12 - SIDEBAR WIDGETS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Candidate Profile Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden"
          >
            {/* Top background glow decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* User Meta Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center border border-white dark:border-slate-800 shadow-md">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-base dark:text-white text-gray-900 line-clamp-1">{profile?.full_name || profile?.email}</h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/20 text-[#0ea5e9] dark:text-sky-400 text-[10px] font-bold rounded border border-sky-100/30 dark:border-sky-500/20 uppercase tracking-wider">
                    {packageName}
                  </span>
                  {packageName !== "MIỄN PHÍ" && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  )}
                </div>
              </div>
            </div>

            {/* Switch Toggle for Job Seeking Status */}
            <div className="p-3.5 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold dark:text-white text-gray-800">Trạng thái tìm việc</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {(profile?.is_looking_for_job !== false) ? "Đang bật chế độ tìm việc" : "Đang tắt tìm việc"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleJobSeeking}
                disabled={updateProfileMutation.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  (profile?.is_looking_for_job !== false) ? "bg-[#0ea5e9]" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (profile?.is_looking_for_job !== false) ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Tối ưu hóa CV bằng AI */}
            <div className="flex flex-col items-center justify-center py-5 border-t border-gray-100/60 dark:border-white/5 text-center">
              <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-sky-100/50 dark:border-sky-500/20 mb-3">
                📄
              </div>
              <h5 className="text-sm font-bold dark:text-white text-gray-900 mb-1">Tối Ưu CV Bằng AI</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400 px-4 leading-relaxed font-medium">
                Tải lên CV của bạn để AI phân tích điểm mạnh, điểm yếu và gợi ý từ khóa phù hợp với công việc.
              </p>
              
              <Link 
                to="/cv-review"
                className="mt-4 px-5 py-2 border border-sky-100 dark:border-sky-950 text-xs font-bold text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 transition-all flex items-center gap-1.5 bg-gradient-to-r from-sky-50 to-white dark:from-slate-900/60 dark:to-slate-800/60 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span>Phân tích CV ngay</span>
              </Link>
            </div>

          </motion.div>

          {/* Quick Links Menu */}
          <div className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-4">
            <h4 className="font-bold text-sm dark:text-white text-gray-900 border-b dark:border-white/5 pb-2">Liên kết nhanh</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/interview-practice"
                className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 text-[#0ea5e9] mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Luyện phỏng vấn</span>
              </Link>
              <Link 
                to="/cv-review"
                className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5 text-emerald-500 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Quản lý CV</span>
              </Link>
              <Link 
                to="/saved-jobs"
                className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Bookmark className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Công việc đã lưu</span>
              </Link>
              <Link 
                to="/settings"
                className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Settings className="w-5 h-5 text-gray-500 dark:text-slate-400 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Cài đặt tài khoản</span>
              </Link>
            </div>
          </div>

          {/* AI 3D Interview Prep Teaser Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-slate-950 border border-white/5 shadow-xl group text-white cursor-pointer"
            onClick={() => navigate("/interview-practice")}
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
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// PUBLIC LANDING PAGE VIEW (WHEN LOGGED OUT)
// ────────────────────────────────────────────────────────────────────────────────
function RenderLandingPage({ theme, provinces, popularTags }) {
  const { showToast } = useUiStore();
  const [searchWord, setSearchWord] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const bookmarkedJobs = [];

  const handleProtectedAction = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    showToast({ message: "Yêu cầu đăng nhập để dùng được tính năng này", type: "warning" });
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
    posted: job.created_at ? new Date(job.created_at).toLocaleDateString("vi-VN") : "Gần đây",
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
    handleProtectedAction(e);
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
                  onClick={handleProtectedAction}
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
                  onClick={handleProtectedAction}
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
                          onSelect={handleProtectedAction}
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
                onClick={handleProtectedAction}
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
                onClick={handleProtectedAction}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white text-xs font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(14,165,233,0.2)] transition-all cursor-pointer whitespace-nowrap"
              >
                Phỏng vấn ngay
              </button>
            </motion.div>

          </div>

          {/* RIGHT COLUMN (4/12 - SIDEBAR WIDGETS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Auth Invitation Card (Sidebar Welcome) */}
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

            {/* Quick Links Menu */}
            <div className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-4">
              <h4 className="font-bold text-sm dark:text-white text-gray-900 border-b dark:border-white/5 pb-2">Liên kết nhanh</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleProtectedAction}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 text-[#0ea5e9] mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Luyện phỏng vấn</span>
                </button>
                <button 
                  onClick={handleProtectedAction}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-emerald-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Quản lý CV</span>
                </button>
                <button 
                  onClick={handleProtectedAction}
                  className="p-3 dark:bg-[#1e293b]/30 bg-slate-50/50 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#0ea5e9]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Bookmark className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold dark:text-slate-300 text-gray-700">Công việc đã lưu</span>
                </button>
                <button 
                  onClick={handleProtectedAction}
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
              onClick={handleProtectedAction}
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
