import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { JobFilters } from "./components/JobFilters";
import { JobCard } from "./components/JobCard";
import { JobDetailView } from "./components/JobDetailView";

const jobsData = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    location: "Hà Nội",
    salary: "25-35 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "3-5 years",
    tags: ["React", "TypeScript", "Node.js"],
    aiMatch: 95,
    posted: "2 ngày trước",
    applicants: 45,
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Hub",
    logo: "💻",
    location: "Remote",
    salary: "28-38 triệu",
    type: "Full-time",
    remote: "Remote",
    experience: "2-4 years",
    tags: ["React", "Node.js", "MongoDB"],
    aiMatch: 88,
    posted: "1 tuần trước",
    applicants: 32,
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Design Studio",
    logo: "🎨",
    location: "TP.HCM",
    salary: "20-30 triệu",
    type: "Full-time",
    remote: "Office",
    experience: "1-3 years",
    tags: ["React", "Vue.js", "CSS"],
    aiMatch: 82,
    posted: "3 ngày trước",
    applicants: 28,
  },
  {
    id: 4,
    title: "Backend Developer (Node.js)",
    company: "E-Commerce Plus",
    logo: "📱",
    location: "Đà Nẵng",
    salary: "22-32 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "2-4 years",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    aiMatch: 78,
    posted: "5 ngày trước",
    applicants: 18,
  },
  {
    id: 5,
    title: "UI/UX Designer",
    company: "Creative Agency",
    logo: "✨",
    location: "Hà Nội",
    salary: "18-28 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "1-3 years",
    tags: ["Figma", "Adobe XD", "UI Design"],
    aiMatch: 75,
    posted: "4 ngày trước",
    applicants: 22,
  },
];

/**
 * Jobs Page
 * Manages job listings, filtering by various criteria, and viewing detailed descriptions.
 */
export function Jobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);

  const toggleBookmark = (jobId) => {
    setBookmarked((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const selectedJobData = jobsData.find((job) => job.id === selectedJob);

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
                  className="flex items-center gap-2 px-4 py-2 border-2 dark:border-white/10 border-gray-200 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 hover:bg-[#f0f9ff] transition-all font-semibold dark:text-slate-300 text-gray-700"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Bộ lọc</span>
                </button>
              )}
              <div>
                <p className="text-sm dark:text-slate-400 text-gray-500">
                  Tìm thấy <span className="font-semibold text-[#0ea5e9]">{jobsData.length}</span> công việc
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-transparent bg-gray-50/50">
            {jobsData.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob === job.id}
                isBookmarked={bookmarked.includes(job.id)}
                onSelect={() => setSelectedJob(job.id)}
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
        </div>
      </main>
    </div>
  );
}
