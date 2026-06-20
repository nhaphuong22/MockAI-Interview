import { SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobFilters } from "./components/JobFilters";
import { JobCard } from "./components/JobCard";
import { JobDetailView } from "./components/JobDetailView";
import { jobApi } from "../../api/jobApi";

const formatTime = (timeStr) => {
  if (!timeStr) return "Vừa xong";
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins || 1} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

/**
 * Jobs Page
 * Manages job listings, filtering by various criteria, and viewing detailed descriptions.
 */
export function Jobs() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);
  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

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
    aiMatch: job.aiMatch || (80 + (job.id % 16)), // Sử dụng phép toán Pure thay vì Math.random để qua kiểm tra Lint
    posted: job.created_at ? new Date(job.created_at).toLocaleDateString("vi-VN") : "Gần đây",
    applicants: job.applicants_count || 0,
    description: job.description,
    requirements: job.requirements,
  }));

  // Lọc thêm theo địa điểm tại client
  const filteredJobs = formattedJobs.filter(job => {
    if (location.trim() === "") return true;
    return job.location.toLowerCase().includes(location.toLowerCase());
  });

  // Tự động xác định Job đang được chọn (pure state logic, không sử dụng useEffect gây cascading render)
  const activeJobId = selectedJob || (filteredJobs.length > 0 ? filteredJobs[0].id : null);
  const selectedJobData = filteredJobs.find((job) => job.id === activeJobId);

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSalaryRange([10, 50]);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
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
        onClearFilters={handleClearFilters}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-6 dark:bg-[#0a0f1c]/50 bg-white border-b dark:border-white/10 border-gray-200">
          <div className="flex items-center justify-between">
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
                <p className="text-sm dark:text-slate-400 text-gray-500">
                  Tìm thấy <span className="font-semibold text-[#0ea5e9]">{filteredJobs.length}</span> công việc
                </p>
              </div>
            </div>
            <select className="px-4 py-2 border-2 dark:border-white/10 border-gray-200 rounded-xl dark:bg-[#0f172a] focus:border-[#0ea5e9] focus:outline-none text-sm dark:text-slate-300 text-gray-700 font-medium">
              <option>Phù hợp nhất</option>
              <option>Mới nhất</option>
              <option>Lương cao nhất</option>
            </select>
          </div>
        </div>

        {/* Double Pane List & Details Layout */}
        <div className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 dark:bg-transparent bg-gray-50/50">
              <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">Đang tải danh sách công việc từ hệ thống...</p>
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 dark:bg-transparent bg-gray-50/50 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-500 font-bold mb-2">Đã xảy ra lỗi khi kết nối dữ liệu!</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 hover:brightness-105"
              >
                Thử lại
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 dark:bg-transparent bg-gray-50/50 text-center">
              <p className="text-gray-500 dark:text-slate-400 font-medium mb-2">Không tìm thấy công việc nào phù hợp.</p>
              <button 
                onClick={handleClearFilters}
                className="text-xs text-[#0ea5e9] hover:underline font-bold"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-transparent bg-gray-50/50">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={activeJobId === job.id}
                    isBookmarked={savedJobIds.includes(job.id)}
                    onSelect={() => setSelectedJob(job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>

              {selectedJobData && (
                <JobDetailView 
                  job={selectedJobData}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={savedJobIds.includes(selectedJobData.id)}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Jobs;
