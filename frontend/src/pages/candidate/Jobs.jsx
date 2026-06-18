import { SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { JobFilters } from "./components/JobFilters";
import { JobCard } from "./components/JobCard";
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
  const [bookmarked, setBookmarked] = useState([]);
  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

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

  const toggleBookmark = (jobId) => {
    setBookmarked((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

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

  const formattedJobs = jobsList.map((jobPost) => {
    let minSalary = null;
    let maxSalary = null;
    let currency = "VND";
    let isVisible = true;
    
    if (jobPost.positions && jobPost.positions.length > 0) {
        const mins = jobPost.positions.map(p => p.salary_min).filter(Boolean);
        const maxs = jobPost.positions.map(p => p.salary_max).filter(Boolean);
        if (mins.length > 0) minSalary = Math.min(...mins);
        if (maxs.length > 0) maxSalary = Math.max(...maxs);
        currency = jobPost.positions[0].salary_currency || "VND";
        isVisible = jobPost.positions.some(p => p.is_salary_visible);
    }

    return {
      id: jobPost.id,
      title: jobPost.title,
      company: jobPost.company_name || "Công ty chưa xác minh",
      logo: jobPost.company_logo || jobPost.company_name?.substring(0, 1).toUpperCase() || "J",
      location: jobPost.company_address || "Việt Nam",
      salary: formatSalary(minSalary, maxSalary, currency, isVisible),
      type: "Chiến dịch", 
      remote: jobPost.positions ? `${jobPost.positions.length} vị trí` : "0 vị trí",
      experience: "Tùy vị trí",
      tags: ["Tuyển dụng"],
      aiMatch: 80,
      posted: jobPost.created_at ? new Date(jobPost.created_at).toLocaleDateString("vi-VN") : "Gần đây",
      applicants: 0,
      description: jobPost.description,
      positions: jobPost.positions || [],
    };
  });

  const filteredJobs = formattedJobs.filter(job => {
    if (location.trim() === "") return true;
    return job.location.toLowerCase().includes(location.toLowerCase());
  });

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSalaryRange([10, 50]);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
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
        <div className="p-6 dark:bg-[#0a0f1c]/50 bg-white border-b dark:border-white/10 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:text-sky-600 transition-all font-semibold text-slate-700 shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Bộ lọc</span>
                </button>
              )}
              <div>
                <p className="text-sm dark:text-slate-400 text-gray-500">
                  Tìm thấy <span className="font-semibold text-[#0ea5e9]">{filteredJobs.length}</span> chiến dịch
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={bookmarked.includes(job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Jobs;
