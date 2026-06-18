import { AlertCircle, Search, MapPin, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompanyJobCard } from "./components/CompanyJobCard";
import { JobDetailView } from "./components/JobDetailView";
import { jobApi } from "../../api/jobApi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

// ── Filter chip options ──────────────────────────────────────────
const SALARY_OPTIONS = [
  "Dưới 10 triệu",
  "10 - 20 triệu",
  "20 - 40 triệu",
  "40 - 60 triệu",
  "Trên 60 triệu",
];

const LEVEL_OPTIONS = [
  "Thực tập sinh",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
  "Quản lý",
];

const TYPE_OPTIONS = [
  "Toàn thời gian",
  "Bán thời gian",
  "Remote",
  "Hybrid",
  "Thực tập",
];

const FIELD_OPTIONS = [
  "IT / Công nghệ",
  "Marketing",
  "Design / UX",
  "Tài chính / Kế toán",
  "Sales / Kinh doanh",
  "Hành chính / Nhân sự",
  "Kỹ thuật",
];

// ── FilterChip dropdown ──────────────────────────────────────────
function FilterChip({ label, options, value, onChange }) {
  const isActive = value && value !== "";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${isActive
              ? "border-[#0ea5e9] bg-sky-50 dark:bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-sky-400"
              : "border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-white/20"
            }`}
        >
          {isActive ? value : label}
          {isActive ? (
            <X
              className="w-3.5 h-3.5 ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] bg-white dark:bg-slate-900 rounded-xl border dark:border-white/10 border-gray-200 shadow-xl shadow-gray-100/80 dark:shadow-black/30 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
          sideOffset={6}
          align="start"
        >
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt}
              onSelect={() => onChange(opt === value ? "" : opt)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer outline-none transition-colors ${opt === value
                  ? "text-[#0ea5e9] bg-sky-50 dark:bg-[#0ea5e9]/10 font-semibold"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
            >
              {opt === value && <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] shrink-0" />}
              {opt !== value && <span className="w-1.5 h-1.5 rounded-full shrink-0" />}
              {opt}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
const formatTime = (timeStr) => {
  if (!timeStr) return "vừa xong";
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

const formatSalary = (min, max, currency, visible) => {
  if (!visible) return "Thương lượng";
  if (!min && !max) return "Thương lượng";
  const fmt = (num) => {
    if (!num) return "";
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
    return num.toLocaleString("vi-VN");
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)} VND`;
  if (min) return `Từ ${fmt(min)} ${currency}`;
  return `Đến ${fmt(max)} ${currency}`;
};

// ── Main Component ─────────────────────────────────────────────────
/**
 * Jobs Page - TopCV-style 2-column layout
 * No sidebar, horizontal filter chips below search bar
 */
export function Jobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterField, setFilterField] = useState("");
  const [sortBy, setSortBy] = useState("relevant");

  // Fetch jobs
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["candidate-jobs-list", search, location],
    queryFn: async () => {
      const res = await jobApi.getJobs({
        status: "OPEN",
        search: search.trim() || undefined,
      });
      return res;
    },
  });

  const jobsList = response?.data?.items || [];

  const toggleBookmark = (jobId) =>
    setBookmarked((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );

  // Map to card format
  const formattedJobs = jobsList.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company_name || "Công ty chưa xác minh",
    logo: job.company_logo || job.company_name?.substring(0, 1).toUpperCase() || "J",
    location: job.company_address || "Việt Nam",
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible),
    type: job.experience_level || "Toàn thời gian",
    remote: job.vacancy_count ? `${job.vacancy_count} chỉ tiêu` : "1 chỉ tiêu",
    experience: job.experience_level || "Không yêu cầu",
    tags: job.requirements
      ? job.requirements.split(",").slice(0, 4).map((t) => t.trim())
      : [],
    aiMatch: job.aiMatch || (75 + (job.id % 20)),
    posted: job.created_at ? formatTime(job.created_at) : "Gần đây",
    applicants: job.applicants_count || 0,
    description: job.description,
    requirements: job.requirements,
  }));

  // Client-side location filter
  const filteredJobs = formattedJobs.filter((job) => {
    if (location.trim() !== "" && !job.location.toLowerCase().includes(location.toLowerCase()))
      return false;
    return true;
  });

  // ── Group jobs by company ──────────────────────────────────────────
  // Each entry: { companyName, companyLogo, companyLocation, jobs[] }
  const groupedByCompany = useMemo(() => {
    const map = new Map();

    filteredJobs.forEach((job) => {
      const key = job.company;
      if (!map.has(key)) {
        map.set(key, {
          companyName: job.company,
          companyLogo: job.logo,
          companyLocation: job.location,
          jobs: [],
        });
      }
      map.get(key).jobs.push(job);
    });

    return Array.from(map.values());
  }, [filteredJobs]);

  const clearAllFilters = () => {
    setFilterSalary("");
    setFilterLevel("");
    setFilterType("");
    setFilterField("");
    setSearch("");
    setSearchInput("");
    setLocation("");
    setLocationInput("");
  };

  // Auto-select first job of first company if nothing selected
  const activeJobId = selectedJob || (filteredJobs.length > 0 ? filteredJobs[0].id : null);
  const selectedJobData = filteredJobs.find((job) => job.id === activeJobId);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setLocation(locationInput);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] dark:bg-[#0a0f1c] bg-[#f3f7fb]">

      {/* ── SEARCH BAR ── */}
      <div className="px-4 pt-4 lg:px-6 flex-shrink-0">
        <div className="mx-auto max-w-[1500px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/70 dark:border-white/5 dark:bg-slate-900/80 dark:shadow-none">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          {/* Keyword search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border dark:border-white/10 border-slate-200 focus-within:border-[#0ea5e9] dark:focus-within:border-[#0ea5e9]/60 transition-colors">
            <Search className="w-4 h-4 dark:text-slate-500 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Từ khóa, chức danh, công ty..."
              className="flex-1 outline-none bg-transparent text-sm dark:text-slate-200 text-gray-700 placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border dark:border-white/10 border-slate-200 focus-within:border-[#0ea5e9] dark:focus-within:border-[#0ea5e9]/60 transition-colors w-80">
            <MapPin className="w-4 h-4 dark:text-slate-500 text-gray-400 shrink-0" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Địa điểm (Toàn quốc, Hà Nội...)"
              className="flex-1 outline-none bg-transparent text-sm dark:text-slate-200 text-gray-700 placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="px-7 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-lg transition-colors text-sm shrink-0 shadow-sm shadow-sky-100 dark:shadow-sky-900/20"
          >
            Tìm kiếm
          </button>
          </form>

      {/* ── FILTER CHIPS ROW ── */}
          <div className="mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
          <FilterChip label="Mức lương" options={SALARY_OPTIONS} value={filterSalary} onChange={setFilterSalary} />
          <FilterChip label="Cấp bậc" options={LEVEL_OPTIONS} value={filterLevel} onChange={setFilterLevel} />
          <FilterChip label="Loại hình" options={TYPE_OPTIONS} value={filterType} onChange={setFilterType} />
          <FilterChip label="Lĩnh vực" options={FIELD_OPTIONS} value={filterField} onChange={setFilterField} />

          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-auto text-xs text-gray-500 hover:text-[#0ea5e9] transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN LAYOUT ── */}
      <div className="flex-1 overflow-hidden px-4 py-4 lg:px-6">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-sky-100 dark:border-slate-800 border-t-[#0ea5e9] animate-spin" />
            <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Đang tải danh sách công việc...</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="font-bold text-gray-700 dark:text-slate-200">Không thể tải dữ liệu</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">Vui lòng kiểm tra kết nối và thử lại.</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-[#0ea5e9] text-white rounded-xl text-sm font-bold hover:bg-[#0284c7] transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="text-5xl mb-2">🔍</div>
            <p className="font-bold text-gray-700 dark:text-slate-200">Không tìm thấy công việc nào</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc khác.</p>
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#0ea5e9] hover:underline font-bold"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[1500px] gap-5">
            {/* LEFT: Grouped by company */}
            <div className="w-[34%] min-w-[340px] max-w-[430px] flex-shrink-0 flex flex-col overflow-hidden">
              {/* Result count – above list only */}
              <div className="flex items-center justify-between pb-3 flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span className="text-slate-800 dark:text-slate-100">{groupedByCompany.length}</span> công ty ·{" "}
                  <span className="text-[#0ea5e9]">{filteredJobs.length}</span> vị trí
                  {search && (
                    <span className="ml-1 text-gray-400 dark:text-slate-500">
                      cho <span className="font-semibold text-[#0ea5e9]">&ldquo;{search}&rdquo;</span>
                    </span>
                  )}
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  Ưu tiên:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-[#0ea5e9] font-semibold outline-none cursor-pointer"
                  >
                    <option value="relevant">Phù hợp nhất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="salary">Lương cao nhất</option>
                  </select>
                </label>
              </div>

              {/* Scrollable company cards */}
              <div className="job-list-scroll flex-1 overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-3 pb-4">
                  {groupedByCompany.map((group) => (
                    <CompanyJobCard
                      key={group.companyName}
                      companyName={group.companyName}
                      companyLogo={group.companyLogo}
                      companyLocation={group.companyLocation}
                      jobs={group.jobs}
                      selectedJobId={activeJobId}
                      bookmarked={bookmarked}
                      onSelectJob={(jobId) => setSelectedJob(jobId)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Job detail */}
            {selectedJobData && (
              <JobDetailView
                job={selectedJobData}
                onToggleBookmark={toggleBookmark}
                isBookmarked={bookmarked.includes(selectedJobData.id)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
