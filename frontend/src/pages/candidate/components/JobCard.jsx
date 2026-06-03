import { MapPin, DollarSign, Briefcase, Clock, Bookmark } from "lucide-react";

/**
 * JobCard Component
 * Displays summary card for a single job listing
 */
export function JobCard({ 
  job, 
  isSelected, 
  isBookmarked, 
  onSelect, 
  onToggleBookmark 
}) {
  return (
    <div
      onClick={onSelect}
      className={`dark:bg-[#0a0f1c]/80 bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-[#0ea5e9] shadow-lg shadow-sky-50/50 dark:shadow-[#0ea5e9]/20"
          : "border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20"
      }`}
    >
      <div className="flex gap-4">
        {/* Company Logo Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-sm">
          {job.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 dark:text-white text-gray-900 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm dark:text-slate-400 text-gray-500 font-medium">{job.company}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 dark:bg-[#0ea5e9]/10 bg-sky-50 text-[#0ea5e9] rounded-full text-xs font-bold border dark:border-[#0ea5e9]/20 border-sky-100/50 shrink-0">
                {job.aiMatch}% phù hợp
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job.id);
                }}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors group shrink-0"
              >
                <Bookmark
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isBookmarked
                      ? "fill-[#0ea5e9] text-[#0ea5e9]"
                      : "dark:text-slate-500 text-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Job Details Meta tags */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium dark:text-slate-400 text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-[#0ea5e9]" />
              <span className="font-semibold text-[#0ea5e9]">{job.salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{job.type}</span>
            </div>
            <div className="px-2 py-0.5 dark:bg-blue-900/30 bg-blue-50 dark:text-blue-300 text-blue-700 rounded text-[10px] uppercase font-bold tracking-wider">
              {job.remote}
            </div>
          </div>

          {/* Tags list */}
          <div className="flex flex-wrap gap-2 mb-3">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 dark:bg-[#0ea5e9]/10 bg-[#f0f9ff] text-[#0ea5e9] rounded-md text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs dark:text-slate-500 text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.posted}</span>
            </div>
            <span>{job.applicants} ứng viên</span>
          </div>
        </div>
      </div>
    </div>
  );
}
