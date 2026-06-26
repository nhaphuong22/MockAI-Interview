import { MapPin, DollarSign, Briefcase, Clock, Bookmark, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * CompanyGroupCard Component
 * Displays a company and all its open job positions in a single frame
 */
export function CompanyGroupCard({
  companyName,
  logo,
  location,
  jobs,
  bookmarked,
  onSelectJob,
  onToggleBookmark
}) {
  return (
    <div className="relative bg-white/70 dark:bg-[#0a0f1c]/60 backdrop-blur-md rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(14,165,233,0.05)] dark:hover:shadow-[0_12px_30px_rgba(14,165,233,0.1)]">
      {/* Company Header */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100/80 dark:border-white/5">
        <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-md shadow-sky-100 dark:shadow-none">
          {logo}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold dark:text-white text-gray-900 truncate">
            {companyName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-sm dark:text-slate-400 text-gray-500 font-medium">
            <MapPin className="w-4 h-4 text-[#0ea5e9]" />
            <span>{location}</span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span className="text-[#0ea5e9] font-bold">{jobs.length} vị trí đang tuyển</span>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex flex-col gap-3">
        {jobs.map((job, index) => (
          <div 
            key={job.id}
            onClick={() => onSelectJob(job.id)}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-transparent hover:border-[#0ea5e9]/20 dark:hover:border-[#0ea5e9]/20 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 cursor-pointer transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1.5">
                <h3 className="text-base font-bold dark:text-slate-200 text-gray-800 group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(job.id);
                    }}
                    className="p-1 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded transition-colors shrink-0"
                  >
                    <Bookmark
                      className={`w-4 h-4 transition-transform hover:scale-110 ${
                        bookmarked.includes(job.id)
                          ? "fill-[#0ea5e9] text-[#0ea5e9]"
                          : "dark:text-slate-500 text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Job Meta Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold dark:text-slate-400 text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#0ea5e9]" />
                  <span className="text-[#0ea5e9]">{job.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{job.posted}</span>
                </div>
                {job.remote && (
                  <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded uppercase text-[9px] font-bold tracking-wider">
                    {job.remote}
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-white/5 text-gray-400 group-hover:text-[#0ea5e9] group-hover:border-[#0ea5e9]/30 dark:group-hover:border-[#0ea5e9]/30 transition-all group-hover:translate-x-1">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
