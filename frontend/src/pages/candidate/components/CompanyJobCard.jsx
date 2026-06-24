import { MapPin, DollarSign, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

/**
 * CompanyJobCard Component
 * Groups all job postings from the same company into one card.
 * Each position row is individually clickable to show its detail on the right.
 */
export function CompanyJobCard({
  companyName,
  companyLogo,
  companyLocation,
  jobs,              // Array of job objects for this company
  selectedJobId,     // Currently selected job id (global)
  bookmarked,        // Array of bookmarked job ids
  onSelectJob,       // (jobId) => void
  onToggleBookmark,  // (jobId) => void
}) {
  const PREVIEW_COUNT = 3;
  const [expanded, setExpanded] = useState(false);

  // Determine if any job in this card is selected
  const isCardActive = jobs.some((j) => j.id === selectedJobId);

  const visibleJobs = expanded ? jobs : jobs.slice(0, PREVIEW_COUNT);
  const hiddenCount = jobs.length - PREVIEW_COUNT;

  const companyInitial =
    typeof companyLogo === "string" && companyLogo.length <= 2
      ? companyLogo
      : (companyName || "?").charAt(0).toUpperCase();

  return (
    <div
      className={`relative rounded-xl border transition-all duration-150 overflow-hidden ${
        isCardActive
          ? "border-sky-200 shadow-sm shadow-sky-100/80 ring-1 ring-sky-100 dark:border-[#0ea5e9]/30 dark:ring-[#0ea5e9]/10 dark:shadow-none"
          : "border-transparent shadow-sm shadow-slate-200/60 hover:border-slate-200 dark:hover:border-white/10"
      } bg-white dark:bg-slate-900/80`}
    >
      {isCardActive && (
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-[#0ea5e9]" />
      )}
      {/* ── Company Header ── */}
      <div className="flex items-center gap-3.5 px-5 pt-5 pb-3.5 border-b border-slate-100 dark:border-white/5">
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm shadow-sky-100 dark:shadow-none">
          {companyInitial}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[14px] text-gray-900 dark:text-white leading-snug truncate">
            {companyName}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{companyLocation}</span>
          </div>
        </div>

        {/* Job count badge */}
        <div className="shrink-0 px-2.5 py-1 bg-sky-50 dark:bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold rounded-full border border-sky-100 dark:border-[#0ea5e9]/20">
          {jobs.length} vị trí
        </div>
      </div>

      {/* ── Position rows ── */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {visibleJobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          const isBookmarked = bookmarked.includes(job.id);

          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`w-full text-left px-5 py-3.5 transition-all ${
                isSelected
                  ? "bg-sky-50/80 dark:bg-[#0ea5e9]/8"
                  : "hover:bg-slate-50 dark:hover:bg-white/3"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Selected accent dot */}
                <div className="flex items-center mt-1.5 shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      isSelected
                        ? "bg-[#0ea5e9] scale-125"
                        : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                </div>

                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[13.5px] font-bold leading-snug truncate transition-colors ${
                        isSelected
                          ? "text-[#0ea5e9]"
                          : "text-gray-800 dark:text-slate-200"
                      }`}
                    >
                      {job.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1 text-[#0ea5e9] text-xs font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{job.type}</span>
                    {job.remote && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">{job.remote}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 text-[11px] font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: match + bookmark */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(job.id);
                    }}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 transition-all ${
                        isBookmarked
                          ? "fill-[#0ea5e9] text-[#0ea5e9]"
                          : "text-gray-300 dark:text-slate-600"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Show more / Show less ── */}
      {jobs.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#0ea5e9] hover:bg-sky-50/60 dark:hover:bg-[#0ea5e9]/5 transition-colors border-t border-gray-100 dark:border-white/5"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Xem thêm {hiddenCount} vị trí khác
            </>
          )}
        </button>
      )}
    </div>
  );
}
