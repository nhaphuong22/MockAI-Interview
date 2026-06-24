import { MapPin, DollarSign, Briefcase, Clock, Bookmark, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * JobCard Component
 * Premium Design for a single job listing
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
      className={`group relative bg-white/80 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl p-5 md:p-6 border cursor-pointer transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-[0_12px_40px_-10px_rgba(14,165,233,0.15)] dark:hover:shadow-[0_12px_40px_-10px_rgba(14,165,233,0.25)] ${
        isSelected
          ? "border-[#0ea5e9] ring-2 ring-sky-100 dark:ring-sky-950/50"
          : "border-slate-200/60 dark:border-white/5 hover:border-[#0ea5e9]/40 dark:hover:border-[#0ea5e9]/40"
      }`}
    >
      {/* Decorative gradient blur on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0ea5e9]/0 to-[#38bdf8]/0 group-hover:from-[#0ea5e9]/5 group-hover:to-[#38bdf8]/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

      <div className="flex gap-4 md:gap-5 relative z-10">
        {/* Company Logo Icon */}
        <div className="shrink-0 relative">
          {job.company_id ? (
            <Link
              to={`/companies/${job.company_id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm hover:shadow-md transition-shadow relative z-10 overflow-hidden"
            >
              {job.logo}
            </Link>
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm relative z-10 overflow-hidden">
              {job.logo}
            </div>
          )}
          {/* Logo backdrop glow */}
          <div className="absolute inset-0 bg-[#0ea5e9]/20 blur-xl scale-90 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header row: Title and Badge/Bookmark */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors leading-tight line-clamp-2">
                {job.title}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                {job.company_id ? (
                  <Link
                    to={`/companies/${job.company_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] transition-colors truncate block"
                  >
                    {job.company}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">{job.company}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-500/10 dark:to-emerald-500/10 text-[#0ea5e9] dark:text-sky-400 rounded-xl text-xs font-bold border border-sky-100/50 dark:border-sky-500/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                {job.aiMatch}% Fit
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job.id);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group/btn shrink-0"
              >
                <Bookmark
                  className={`w-4.5 h-4.5 transition-transform group-hover/btn:scale-110 ${
                    isBookmarked
                      ? "fill-[#0ea5e9] text-[#0ea5e9]"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Meta Info (Location, Salary, Type) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.location}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10 border border-[#0ea5e9]/10 text-xs font-bold text-[#0ea5e9]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{job.salary}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.type}</span>
            </div>
          </div>

          <div className="mt-auto pt-5 space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100/50 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-[#0ea5e9] text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-bold tracking-wide transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Đăng: {job.posted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{job.applicants} ứng viên</span>
                <span className="mx-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-emerald-500 dark:text-emerald-400">{job.remote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
