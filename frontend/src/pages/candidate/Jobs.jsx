import { SlidersHorizontal, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { JobSearchBanner } from "./components/JobSearchBanner";
import { JobCard } from "./components/JobCard";
import { AiTeaserSidebar } from "./components/AiTeaserSidebar";
import { jobApi } from "../../api/jobApi";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/useAuthStore";

const cleanLocationName = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/thành phố/g, "")
    .replace(/tp\.?/g, "")
    .replace(/tỉnh/g, "")
    .replace(/hồ chí minh/g, "hcm")
    .replace(/\s+/g, "")
    .trim();
};

const JOBS_PER_PAGE = 8;

export function Jobs() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const showToast = useUiStore((state) => state.showToast);

  // States for TopCV-style search & filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [salarySelect, setSalarySelect] = useState("all");
  const [experienceSelect, setExperienceSelect] = useState("all");
  const [levelSelect, setLevelSelect] = useState("all");
  const [formatSelect, setFormatSelect] = useState("all");
  const [genderSelect, setGenderSelect] = useState("all");
  
  const [sortBy, setSortBy] = useState("Phù hợp nhất");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync search state from Dashboard redirect
  useEffect(() => {
    if (routeLocation.state) {
      if (routeLocation.state.search !== undefined) {
        setSearch(routeLocation.state.search);
      }
      if (routeLocation.state.location !== undefined) {
        setLocation(routeLocation.state.location);
      }
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  // Reset page to 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, location, selectedField, salarySelect, experienceSelect, levelSelect, formatSelect, genderSelect, sortBy]);

  // 1. Fetch Job Listings from API
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["candidate-jobs-list", search, location],
    queryFn: async () => {
      const res = await jobApi.getJobs({
        status: "OPEN",
        search: search.trim() || undefined,
      });
      return res;
    }
  });

  const jobsList = response?.data?.items || [];

  // 2. Fetch saved jobs list
  const { data: savedJobIds = [] } = useQuery({
    queryKey: ["savedJobIds"],
    queryFn: async () => {
      const res = await jobApi.getSavedJobs({ returnIdsOnly: true });
      return res.data || [];
    },
    enabled: !!isAuthenticated
  });

  // Bookmark Mutation
  const toggleMutation = useMutation({
    mutationFn: (jobId) => jobApi.toggleSavedJob(jobId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["savedJobIds"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      
      const payload = res?.data || res;
      showToast({ 
        message: payload?.message || "Đã cập nhật trạng thái lưu việc làm.", 
        type: "success" 
      });
    },
    onError: (err) => {
      showToast({ 
        message: err.response?.data?.error || err.response?.data?.message || "Có lỗi xảy ra khi lưu việc làm.", 
        type: "error" 
      });
    }
  });

  const toggleBookmark = (jobId) => {
    if (!isAuthenticated) {
      showToast({ message: "Yêu cầu đăng nhập để dùng được tính năng này", type: "warning" });
      return;
    }
    toggleMutation.mutate(jobId);
  };

  // Format Salary Helper
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

  // 3. Map API data to UI structure
  const formattedJobs = jobsList.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company_name || "Công ty chưa xác minh",
    company_id: job.company_id,
    logo: job.company_logo || job.company_name?.substring(0, 1).toUpperCase() || "J",
    location: job.company_address || "Việt Nam",
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible),
    type: job.experience_level || "Không yêu cầu", 
    remote: job.vacancy_count ? `${job.vacancy_count} chỉ tiêu` : "1 chỉ tiêu",
    experience: job.experience_level || "Không yêu cầu",
    tags: job.requirements ? job.requirements.split(",").slice(0, 3).map(t => t.trim()) : ["Tuyển dụng"],
    salaryMin: Number(job.salary_min || 0),
    salaryMax: Number(job.salary_max || 999999999),
    isSalaryVisible: job.is_salary_visible !== false,
    aiMatch: job.aiMatch || (82 + (job.id % 14)),
    posted: job.posted_time_text || "Vừa xong",
    createdAt: job.created_at,
    description: job.description || "",
    requirements: job.requirements || ""
  }));

  // Client-side filtering logic with complete TopCV options
  const filteredJobs = formattedJobs.filter(job => {
    // 1. Search Query filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(searchLower);
      const matchCompany = job.company.toLowerCase().includes(searchLower);
      const matchReq = (job.requirements || "").toLowerCase().includes(searchLower);
      if (!matchTitle && !matchCompany && !matchReq) return false;
    }

    // 2. Location filter
    if (location.trim() !== "") {
      const jobLocClean = cleanLocationName(job.location);
      const searchLocClean = cleanLocationName(location);
      if (!jobLocClean.includes(searchLocClean) && !searchLocClean.includes(jobLocClean)) return false;
    }

    // 3. Field Filter (Lĩnh vực)
    if (selectedField !== "all") {
      const jobText = `${job.title} ${job.tags.join(" ")}`.toLowerCase();
      if (selectedField === "IT") {
        const matchesIT = jobText.includes("it") || jobText.includes("software") || jobText.includes("developer") || jobText.includes("web") || jobText.includes("coder");
        if (!matchesIT) return false;
      } else {
        if (!jobText.includes(selectedField.toLowerCase())) return false;
      }
    }

    // 4. Salary Select Filter (Mức lương chọn nhanh)
    if (salarySelect !== "all") {
      if (salarySelect === "negotiable") {
        if (job.isSalaryVisible) return false; // Chỉ lấy lương thỏa thuận/ẩn
      } else {
        if (!job.isSalaryVisible) return false; // Không lấy lương thỏa thuận nếu chọn khoảng cụ thể
        
        const salaryMinTr = job.salaryMin / 1000000;
        const salaryMaxTr = job.salaryMax / 1000000;

        if (salarySelect === "under_10") {
          if (salaryMinTr > 10) return false;
        } else if (salarySelect === "10_15") {
          if (salaryMaxTr < 10 || salaryMinTr > 15) return false;
        } else if (salarySelect === "15_20") {
          if (salaryMaxTr < 15 || salaryMinTr > 20) return false;
        } else if (salarySelect === "20_25") {
          if (salaryMaxTr < 20 || salaryMinTr > 25) return false;
        } else if (salarySelect === "25_30") {
          if (salaryMaxTr < 25 || salaryMinTr > 30) return false;
        } else if (salarySelect === "30_50") {
          if (salaryMaxTr < 30 || salaryMinTr > 50) return false;
        } else if (salarySelect === "over_50") {
          if (salaryMinTr < 50) return false;
        }
      }
    }

    // 5. Experience Select Filter (Kinh nghiệm chi tiết)
    if (experienceSelect !== "all") {
      const expText = job.experience.toLowerCase();
      if (experienceSelect === "none") {
        const matchNone = expText.includes("không") || expText.includes("0") || expText.includes("fresher");
        if (!matchNone) return false;
      } else if (experienceSelect === "under_1") {
        const matchUnder1 = expText.includes("dưới 1") || expText.includes("0-1") || expText.includes("intern");
        if (!matchUnder1) return false;
      } else if (experienceSelect === "over_5") {
        const matchOver5 = expText.includes("5+") || expText.includes("trên 5") || expText.includes("lead") || expText.includes("manager");
        if (!matchOver5) return false;
      } else {
        // Lọc theo số năm cụ thể (1, 2, 3, 4, 5)
        const year = experienceSelect;
        const matchYear = expText.includes(year) || expText.includes(`${year} năm`);
        if (!matchYear) return false;
      }
    }

    // 6. Level Select Filter (Cấp bậc)
    if (levelSelect !== "all") {
      const jobText = `${job.title} ${job.type} ${job.remote}`.toLowerCase();
      if (levelSelect === "intern") {
        const isIntern = jobText.includes("thực tập") || jobText.includes("intern");
        if (!isIntern) return false;
      } else if (levelSelect === "staff") {
        const isStaff = jobText.includes("junior") || jobText.includes("mid") || jobText.includes("senior") || jobText.includes("nhân viên");
        if (!isStaff) return false;
      } else if (levelSelect === "leader") {
        const isLeader = jobText.includes("lead") || jobText.includes("trưởng nhóm");
        if (!isLeader) return false;
      } else if (levelSelect === "manager") {
        const isManager = jobText.includes("manager") || jobText.includes("trưởng phòng") || jobText.includes("quản lý");
        if (!isManager) return false;
      } else if (levelSelect === "director") {
        const isDirector = jobText.includes("director") || jobText.includes("giám đốc") || jobText.includes("executive");
        if (!isDirector) return false;
      }
    }

    // 7. Format Select Filter (Hình thức)
    if (formatSelect !== "all") {
      const jobText = `${job.title} ${job.type} ${job.remote}`.toLowerCase();
      if (formatSelect === "fulltime") {
        if (!jobText.includes("full") && !jobText.includes("toàn thời gian")) return false;
      } else if (formatSelect === "parttime") {
        if (!jobText.includes("part") && !jobText.includes("bán thời gian")) return false;
      } else if (formatSelect === "internship") {
        if (!jobText.includes("intern") && !jobText.includes("thực tập")) return false;
      } else if (formatSelect === "remote") {
        if (!jobText.includes("remote") && !jobText.includes("từ xa")) return false;
      }
    }

    // 8. Gender Select Filter (Giới tính)
    if (genderSelect !== "all") {
      const jobDesc = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
      if (genderSelect === "male") {
        if (jobDesc.includes("yêu cầu nữ") || jobDesc.includes("chỉ tuyển nữ")) return false;
      } else if (genderSelect === "female") {
        if (jobDesc.includes("yêu cầu nam") || jobDesc.includes("chỉ tuyển nam")) return false;
      }
    }

    return true;
  });

  // Client-side Sorting logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "Mới nhất") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === "Lương cao nhất") {
      const salaryA = a.salaryMax || 0;
      const salaryB = b.salaryMax || 0;
      if (salaryB !== salaryA) {
        return salaryB - salaryA;
      }
      return (b.salaryMin || 0) - (a.salaryMin || 0);
    }
    // Default "Phù hợp nhất" (AI Match score)
    return b.aiMatch - a.aiMatch;
  });

  // Client-side Pagination
  const totalJobsCount = sortedJobs.length;
  const totalPages = Math.ceil(totalJobsCount / JOBS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSelectedField("all");
    setSalarySelect("all");
    setExperienceSelect("all");
    setLevelSelect("all");
    setFormatSelect("all");
    setGenderSelect("all");
    setSortBy("Phù hợp nhất");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Filters Section */}
      <JobSearchBanner
        search={search}
        onSearchChange={setSearch}
        location={location}
        onLocationChange={setLocation}
        
        selectedField={selectedField}
        onFieldChange={setSelectedField}
        salarySelect={salarySelect}
        onSalarySelectChange={setSalarySelect}
        experienceSelect={experienceSelect}
        onExperienceSelectChange={setExperienceSelect}
        levelSelect={levelSelect}
        onLevelSelectChange={setLevelSelect}
        formatSelect={formatSelect}
        onFormatSelectChange={setFormatSelect}
        genderSelect={genderSelect}
        onGenderSelectChange={setGenderSelect}
        
        onClearFilters={handleClearFilters}
        onSearchSubmit={() => refetch()}
      />

      {/* Main Content Layout (2 Columns) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Job List & Pagination */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          {/* Controls bar */}
          <div className="p-4 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between gap-4">
            <span className="text-xs dark:text-slate-400 text-gray-500 font-semibold">
              Tìm thấy <span className="text-[#0ea5e9] font-bold">{totalJobsCount}</span> công việc phù hợp
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] dark:text-slate-400 text-gray-500 font-bold uppercase tracking-wider shrink-0">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border dark:border-white/10 border-gray-200 rounded-xl dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none text-xs dark:text-slate-300 text-gray-700 font-semibold cursor-pointer"
              >
                <option value="Phù hợp nhất">Phù hợp nhất</option>
                <option value="Mới nhất">Mới nhất</option>
                <option value="Lương cao nhất">Lương cao nhất</option>
              </select>
            </div>
          </div>

          {/* Jobs List container */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl min-h-[300px]">
                <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
                <p className="text-gray-500 dark:text-slate-400 text-sm font-semibold">Đang tìm tin tuyển dụng tốt nhất cho bạn...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl min-h-[300px] text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-500 font-bold mb-2">Đã xảy ra lỗi khi kết nối dữ liệu!</p>
                <button 
                  onClick={() => refetch()} 
                  className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 hover:brightness-105"
                >
                  Thử lại
                </button>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl min-h-[300px] text-center">
                <p className="text-gray-500 dark:text-slate-400 font-semibold mb-2">Không tìm thấy công việc nào phù hợp.</p>
                <button 
                  onClick={handleClearFilters}
                  className="text-xs text-[#0ea5e9] hover:underline font-bold"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <motion.div 
                className="flex flex-col gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <JobCard
                        job={job}
                        isSelected={false}
                        isBookmarked={savedJobIds.includes(job.id)}
                        onSelect={() => navigate(`/jobs/${job.id}`)}
                        onToggleBookmark={toggleBookmark}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Simple Pagination Bar */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 py-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-slate-500 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white border-transparent shadow-md"
                      : "border-gray-100 dark:border-white/5 dark:text-slate-300 text-slate-600 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-slate-500 shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: AI Teaser & Recommendations */}
        <AiTeaserSidebar
          recommendedJobs={formattedJobs}
          onSelectJob={(id) => navigate(`/jobs/${id}`)}
        />
      </div>
    </div>
  );
}

export default Jobs;
