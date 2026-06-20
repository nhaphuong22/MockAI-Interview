import { SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { JobFilters } from "./components/JobFilters";
import { CompanyGroupCard } from "./components/CompanyGroupCard";
import { jobApi } from "../../api/jobApi";

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



/**
 * Jobs Page
 * Manages job listings, filtering by various criteria, and viewing detailed descriptions.
 */
export function Jobs() {

  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);

  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [bookmarked, setBookmarked] = useState([]);

  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [sortBy, setSortBy] = useState("Phù hợp nhất");


  // Đồng bộ hóa thông tin tìm kiếm khi được chuyển hướng từ Dashboard
  useEffect(() => {
    if (routeLocation.state) {
      if (routeLocation.state.search !== undefined) {
        setSearch(routeLocation.state.search);
      }
      if (routeLocation.state.location !== undefined) {
        setLocation(routeLocation.state.location);
      }
      // Dọn dẹp state để không tự động điền lại khi reload
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  // 1. Gọi API lấy danh sách tin tuyển dụng từ DB
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["candidate-jobs-list", search, location],
    queryFn: async () => {
      const res = await jobApi.getJobs({
        status: "OPEN", // Ứng viên chỉ xem các job đang tuyển dụng
        search: search.trim() || undefined,
      });
      return res; // interceptor đã bóc tách res.data
    }
  });

  const jobsList = response?.data?.items || [];

  // Gọi API lấy danh sách ID công việc đã lưu
  const { data: savedJobIds = [] } = useQuery({
    queryKey: ["savedJobIds"],
    queryFn: async () => {
      const res = await jobApi.getSavedJobs({ returnIdsOnly: true });
      return res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (jobId) => jobApi.toggleSavedJob(jobId),
    onSuccess: () => {
      // Refresh cache để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["savedJobIds"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    }
  });

  const toggleBookmark = (jobId) => {
    toggleMutation.mutate(jobId);
  };

  // Định dạng hiển thị mức lương
  const formatSalary = (min, max, currency, visible) => {
    if (!visible) return "Thương lượng (Ẩn)";
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

  // 2. Mapping dữ liệu thật từ DB sang format của JobCard & JobDetailView
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
    salaryMin: Number(job.salary_min || 0),
    salaryMax: Number(job.salary_max || 999999999),
    isSalaryVisible: job.is_salary_visible !== false,
    aiMatch: job.aiMatch || (82 + (job.id % 14)),
    posted: job.created_at ? new Date(job.created_at).toLocaleDateString("vi-VN") : "Gần đây",
    applicants: job.applicants_count || 0,
    createdAt: job.created_at,
  }));

  // Lọc nâng cao tại client-side
  const filteredJobs = formattedJobs.filter(job => {
    // 1. Lọc theo từ khóa tìm kiếm (nếu search từ dashboard)
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(searchLower);
      const matchCompany = job.company.toLowerCase().includes(searchLower);
      const matchDesc = (job.description || "").toLowerCase().includes(searchLower);
      const matchReq = (job.requirements || "").toLowerCase().includes(searchLower);
      if (!matchTitle && !matchCompany && !matchDesc && !matchReq) return false;
    }

    // 2. Lọc theo địa điểm (so sánh thông minh bỏ các tiền tố/viết tắt như TP, Tỉnh)
    if (location.trim() !== "") {
      const jobLocClean = cleanLocationName(job.location);
      const searchLocClean = cleanLocationName(location);
      if (!jobLocClean.includes(searchLocClean) && !searchLocClean.includes(jobLocClean)) return false;
    }

    // 3. Lọc theo mức lương (triệu VND)
    const minLimit = salaryRange[0] * 1000000;
    const maxLimit = salaryRange[1] * 1000000;
    if (job.isSalaryVisible && (job.salaryMin > 0 || job.salaryMax < 999999999)) {
      if (salaryRange[1] < 50) {
        if (job.salaryMax < minLimit || job.salaryMin > maxLimit) return false;
      } else {
        if (job.salaryMax < minLimit) return false;
      }
    }

    // 4. Lọc theo Lĩnh vực (IT, Marketing, Design, Finance, Sales)
    if (selectedFields.length > 0) {
      const jobText = `${job.title} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
      const matchesField = selectedFields.some(field => {
        if (field === "IT") {
          return jobText.includes("it") || jobText.includes("software") || jobText.includes("developer") || jobText.includes("web") || jobText.includes("technology") || jobText.includes("coder");
        }
        return jobText.includes(field.toLowerCase());
      });
      if (!matchesField) return false;
    }

    // 5. Lọc theo Kinh nghiệm ("0-1 năm", "1-3 năm", "3-5 năm", "5+ năm")
    if (selectedExperiences.length > 0) {
      const expText = job.experience.toLowerCase();
      const matchesExp = selectedExperiences.some(exp => {
        if (exp === "0-1 năm") {
          return expText.includes("0-1") || expText.includes("không yêu cầu") || expText.includes("dưới 1") || expText.includes("fresher") || expText.includes("intern") || expText.includes("junior");
        }
        if (exp === "1-3 năm") {
          return expText.includes("1-3") || expText.includes("1 đến 3") || expText.includes("junior") || expText.includes("mid");
        }
        if (exp === "3-5 năm") {
          return expText.includes("3-5") || expText.includes("3 đến 5") || expText.includes("senior") || expText.includes("mid");
        }
        if (exp === "5+ năm") {
          return expText.includes("5+") || expText.includes("trên 5") || expText.includes("5 năm") || expText.includes("senior") || expText.includes("lead") || expText.includes("manager");
        }
        return false;
      });
      if (!matchesExp) return false;
    }

    // 6. Lọc theo Hình thức ("Full-time", "Part-time", "Remote", "Hybrid", "Office")
    if (selectedFormats.length > 0) {
      const jobText = `${job.title} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
      const matchesFormat = selectedFormats.some(format => {
        return jobText.includes(format.toLowerCase());
      });
      if (!matchesFormat) return false;
    }

    return true;
  });

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
    // "Phù hợp nhất" (Mặc định)
    return b.aiMatch - a.aiMatch;
  });

  // Nhóm các công việc theo công ty, giữ nguyên thứ tự sắp xếp theo công việc phù hợp nhất
  const groupedCompanyJobs = [];
  const companyIndexMap = {};

  sortedJobs.forEach(job => {
    if (companyIndexMap[job.company] === undefined) {
      companyIndexMap[job.company] = groupedCompanyJobs.length;
      groupedCompanyJobs.push({
        companyName: job.company,
        logo: job.logo,
        location: job.location,
        jobs: []
      });
    }
    groupedCompanyJobs[companyIndexMap[job.company]].jobs.push(job);
  });

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSalaryRange([10, 50]);
    setSelectedFields([]);
    setSelectedExperiences([]);
    setSelectedFormats([]);
    setSortBy("Phù hợp nhất");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filter Options */}
      <JobFilters 
        showFilters={showFilters}
        onHideFilters={() => setShowFilters(false)}
        salaryRange={salaryRange}
        onSalaryRangeChange={setSalaryRange}
        search={search}
        onSearchChange={setSearch}
        location={location}
        onLocationChange={setLocation}
        selectedFields={selectedFields}
        onFieldsChange={setSelectedFields}
        selectedExperiences={selectedExperiences}
        onExperiencesChange={setSelectedExperiences}
        selectedFormats={selectedFormats}
        onFormatsChange={setSelectedFormats}
        onClearFilters={handleClearFilters}
      />

      <div className="flex-1 flex flex-col gap-6">
        {/* Top Control Bar */}
        <div className="p-6 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border dark:border-white/5 border-gray-100 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 dark:border-white/10 border-gray-200 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 hover:bg-[#f0f9ff] transition-all font-semibold dark:text-slate-300 text-gray-700 cursor-pointer"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Bộ lọc</span>
              </button>
            )}
            <div>
              <p className="text-sm dark:text-slate-400 text-gray-500 font-medium">
                Tìm thấy <span className="font-semibold text-[#0ea5e9]">{filteredJobs.length}</span> công việc phù hợp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs dark:text-slate-400 text-gray-500 font-semibold shrink-0">Sắp xếp theo:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 dark:border-white/10 border-gray-200 rounded-xl dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none text-sm dark:text-slate-300 text-gray-700 font-semibold cursor-pointer"
            >
              <option value="Phù hợp nhất">Phù hợp nhất</option>
              <option value="Mới nhất">Mới nhất</option>
              <option value="Lương cao nhất">Lương cao nhất</option>
            </select>
          </div>
        </div>

        {/* Job List Container */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border dark:border-white/5 border-gray-100 rounded-3xl min-h-[300px]">
              <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Đang tải danh sách công việc từ hệ thống...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border dark:border-white/5 border-gray-100 rounded-3xl min-h-[300px] text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-500 font-bold mb-2">Đã xảy ra lỗi khi kết nối dữ liệu!</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 hover:brightness-105"
              >
                Thử lại
              </button>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 dark:bg-[#0f172a]/60 bg-white/70 backdrop-blur-xl border dark:border-white/5 border-gray-100 rounded-3xl min-h-[300px] text-center">
              <p className="text-gray-500 dark:text-slate-400 font-medium mb-2">Không tìm thấy công việc nào phù hợp.</p>
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
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {groupedCompanyJobs.map((group, index) => (
                <motion.div
                  key={group.companyName + index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >

                  <JobCard
                    job={job}

                    isSelected={false}
                    isBookmarked={savedJobIds.includes(job.id)}
                    onSelect={() => navigate(`/jobs/${job.id}`)}

                  <CompanyGroupCard
                    companyName={group.companyName}
                    logo={group.logo}
                    location={group.location}
                    jobs={group.jobs}
                    bookmarked={bookmarked}
                    onSelectJob={(id) => navigate(`/jobs/${id}`)}

                    onToggleBookmark={toggleBookmark}
                  />
                </motion.div>
              ))}
            </motion.div>

          )}
        </div>
      </div>
    </div>
  );
}

export default Jobs;
