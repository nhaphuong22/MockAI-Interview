import { SlidersHorizontal, Loader2, Briefcase } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../../api/jobApi";
import { JobFilters } from "./components/JobFilters";
import { JobCard } from "./components/JobCard";
import { JobDetailView } from "./components/JobDetailView";

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
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);

  // Gọi API lấy danh sách Job thực tế từ DB
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["jobs-list"],
    queryFn: async () => {
      const res = await jobApi.getJobs({ status: "OPEN" });
      return res; // Axios client bóc tách response.data
    }
  });

  const rawJobs = response?.data?.items || [];

  // Ánh xạ dữ liệu từ backend sang định dạng frontend component yêu cầu
  const jobs = rawJobs.map(item => {
    let salaryText = "Thương lượng";
    if (item.is_salary_visible) {
      if (item.salary_min && item.salary_max) {
        salaryText = `${(item.salary_min / 1000000).toFixed(0)}-${(item.salary_max / 1000000).toFixed(0)} triệu`;
      } else if (item.salary_min) {
        salaryText = `Từ ${(item.salary_min / 1000000).toFixed(0)} triệu`;
      } else if (item.salary_max) {
        salaryText = `Lên đến ${(item.salary_max / 1000000).toFixed(0)} triệu`;
      }
    }

    const tags = item.requirements
      ? item.requirements.split(",").map(t => t.trim())
      : ["React", "JavaScript"];

    return {
      id: item.id,
      title: item.title,
      company: item.company_name || "Doanh nghiệp tuyển dụng",
      logo: item.company_logo || item.company_name?.substring(0, 1).toUpperCase() || "J",
      location: item.company_address || "Việt Nam",
      salary: salaryText,
      type: "Full-time",
      remote: item.company_address?.toLowerCase().includes("remote") ? "Remote" : "Hybrid",
      experience: item.experience_level || "Không yêu cầu",
      tags: tags.slice(0, 3),
      aiMatch: 90, // Mặc định score AI match
      posted: formatTime(item.created_at),
      applicants: 12,
      description: item.description
    };
  });

  const toggleBookmark = (jobId) => {
    setBookmarked((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // Mặc định chọn job đầu tiên trong list nếu chưa chọn job nào
  const currentSelectedJobId = selectedJobId || (jobs.length > 0 ? jobs[0].id : null);
  const selectedJobData = jobs.find((job) => job.id === currentSelectedJobId);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar Filter Options */}
      <JobFilters 
        showFilters={showFilters}
        onHideFilters={() => setShowFilters(false)}
        salaryRange={salaryRange}
        onSalaryRangeChange={setSalaryRange}
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
                  Tìm thấy <span className="font-semibold text-[#0ea5e9]">{isLoading ? "..." : jobs.length}</span> công việc
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
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
              <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
              <p className="text-gray-500 font-semibold text-sm">Đang tải danh sách việc làm...</p>
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50 text-red-500 font-bold">
              Đã xảy ra lỗi khi tải danh sách việc làm. Vui lòng thử lại!
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có việc làm nào</h3>
              <p className="text-gray-500 font-medium max-w-sm">Hiện tại chưa có tin tuyển dụng nào được đăng. Quay lại sau bạn nhé!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-transparent bg-gray-50/50">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={currentSelectedJobId === job.id}
                    isBookmarked={bookmarked.includes(job.id)}
                    onSelect={() => setSelectedJobId(job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>

              {selectedJobData && (
                <JobDetailView 
                  job={selectedJobData}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={bookmarked.includes(selectedJobData.id)}
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
