import { MapPin, DollarSign, Briefcase, Clock, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

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
      className={`relative bg-white/70 dark:bg-[#0a0f1c]/60 backdrop-blur-md rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.08)] dark:hover:shadow-[0_20px_40px_rgba(14,165,233,0.18)] ${
        isSelected
          ? "border-[#0ea5e9] ring-2 ring-sky-100 dark:ring-sky-950/50"
          : "border-gray-100 dark:border-white/5 hover:border-[#0ea5e9]/50 dark:hover:border-[#0ea5e9]/30"
      }`}
    >
      <div className="flex gap-4">
        {/* Company Logo Icon */}
        {job.company_id ? (
          <Link
            to={`/companies/${job.company_id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-md shadow-sky-100 dark:shadow-none hover:opacity-90 transition-opacity"
          >
            {job.logo}
          </Link>
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-md shadow-sky-100 dark:shadow-none">
            {job.logo}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold dark:text-white text-gray-900 group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                {job.title}
              </h3>

              {job.company_id ? (
                <Link
                  to={`/companies/${job.company_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm dark:text-slate-400 text-gray-500 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] font-medium transition-colors inline-block"
                >
                  {job.company}
                </Link>
              ) : (
                <p className="text-sm dark:text-slate-400 text-gray-500 font-medium">{job.company}</p>
              )}

            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job.id);
                }}
                className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors group shrink-0"
              >
                <Bookmark
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isBookmarked
                      ? "fill-[#0ea5e9] text-[#0ea5e9]"
                      : "dark:text-slate-500 text-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Job Details Meta tags */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold dark:text-slate-400 text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#0ea5e9]" />
              <span className="font-bold text-[#0ea5e9]">{job.salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span>{job.type}</span>
            </div>
            <div className="px-2 py-0.5 bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded text-[9px] uppercase font-bold tracking-wider border border-sky-100/20 dark:border-sky-900/30">
              {job.remote}
            </div>
          </div>

          {/* Tags list */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-white/5 rounded-md text-[10px] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] dark:text-slate-500 text-gray-400 border-t border-gray-100/50 dark:border-white/5 pt-3 mt-2">
            <div className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{job.posted}</span>
            </div>
            <span className="font-semibold text-gray-600 dark:text-slate-400">{job.applicants} ứng viên</span>
          </div>
        </div>
      </div>
    </div>
  );
}
