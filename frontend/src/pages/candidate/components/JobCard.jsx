import { MapPin, DollarSign, Briefcase, Clock, Bookmark, Crown, Sparkles } from "lucide-react";
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
  onToggleBookmark,
  onReport
}) {
  const isVip = job.company_is_vip === true || job.companyIsVip === true || job.is_vip === true;
  const vipThemeColor = isVip ? (job.company_vip_theme_color || job.companyVipThemeColor || "#0ea5e9") : null;
  const vipBorderStyle = isVip ? (job.company_vip_border_style || job.companyVipBorderStyle || "gradient-glow") : null;

  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer transition-all duration-500 hover:-translate-y-1.5"
    >
      {/* Outer Glow Effect cho VIP */}
      {isVip && !isSelected && (
        <div 
          className="absolute -inset-[1.5px] rounded-2xl opacity-40 group-hover:opacity-100 blur-[2px] transition-all duration-700 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${vipThemeColor}90, transparent 40%, transparent 60%, ${vipThemeColor}90)` }}
        ></div>
      )}

      {/* Main Card Container */}
      <div 
        className={`relative h-full bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-2xl rounded-2xl p-6 border transition-all duration-300 overflow-hidden ${
          isSelected
            ? "border-[#0ea5e9] ring-2 ring-sky-100 dark:ring-sky-950/50"
            : isVip
              ? ""
              : "border-gray-100 dark:border-white/5 hover:border-[#0ea5e9]/50 dark:hover:border-[#0ea5e9]/30"
        }`}
        style={{
          borderColor: (isVip && !isSelected) ? `${vipThemeColor}80` : undefined,
          boxShadow: (isVip && !isSelected) ? `0 0 20px ${vipThemeColor}40, inset 0 0 15px ${vipThemeColor}20` : '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        {/* Animated Inner Highlight (Top Right) */}
        {isVip && !isSelected && (
          <div 
            className="absolute -top-20 -right-20 w-40 h-40 opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-[40px] rounded-full pointer-events-none"
            style={{ backgroundColor: vipThemeColor }}
          ></div>
        )}
        
        {/* Animated Inner Highlight (Bottom Left) */}
        {isVip && !isSelected && (
          <div 
            className="absolute -bottom-20 -left-20 w-40 h-40 opacity-10 group-hover:opacity-30 transition-opacity duration-700 blur-[40px] rounded-full pointer-events-none"
            style={{ backgroundColor: vipThemeColor }}
          ></div>
        )}

        <div className="flex gap-4 relative z-10">
        {/* Company Logo Icon */}
        {job.company_id ? (
          <Link
            to={`/companies/${job.company_id}`}
            onClick={(e) => e.stopPropagation()}
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-md hover:opacity-90 transition-all overflow-visible relative animate-fade-in ${!isVip ? 'bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]' : ''}`}
            style={{
              background: isVip ? (vipBorderStyle === 'gradient-glow' ? `linear-gradient(to bottom right, ${vipThemeColor}, ${vipThemeColor}cc)` : vipThemeColor) : undefined,
              boxShadow: (isVip && vipBorderStyle === 'gradient-glow')
                ? `0 0 15px ${vipThemeColor}80`
                : undefined
            }}
          >
            {job.logo && (job.logo.startsWith("http") || job.logo.startsWith("/") || job.logo.startsWith("data:")) ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
            ) : (
              job.logo
            )}

            {/* VIP badge crown rendering */}
            {isVip && vipBorderStyle === 'crown-badge' && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <Crown size={10} className="fill-white text-white" />
              </div>
            )}

            {/* VIP badge sparkles rendering */}
            {isVip && vipBorderStyle === 'sparkle-stars' && (
              <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
            )}
          </Link>
        ) : (
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white shadow-md overflow-visible relative ${!isVip ? 'bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]' : ''}`}
            style={{
              background: isVip ? (vipBorderStyle === 'gradient-glow' ? `linear-gradient(to bottom right, ${vipThemeColor}, ${vipThemeColor}cc)` : vipThemeColor) : undefined,
              boxShadow: (isVip && vipBorderStyle === 'gradient-glow')
                ? `0 0 15px ${vipThemeColor}80`
                : undefined
            }}
          >
            {job.logo && (job.logo.startsWith("http") || job.logo.startsWith("/") || job.logo.startsWith("data:")) ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
            ) : (
              job.logo
            )}

            {/* VIP badge crown rendering */}
            {isVip && vipBorderStyle === 'crown-badge' && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <Crown size={10} className="fill-white text-white" />
              </div>
            )}

            {/* VIP badge sparkles rendering */}
            {isVip && vipBorderStyle === 'sparkle-stars' && (
              <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold dark:text-white text-gray-900 group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                {job.title}
              </h3>

              {job.company_id ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/companies/${job.company_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-bold transition-colors inline-block relative"
                    style={{
                      color: isVip ? vipThemeColor : undefined,
                      textShadow: isVip ? `0 0 10px ${vipThemeColor}90` : undefined
                    }}
                  >
                    {job.company}
                  </Link>
                  {isVip && (
                    <span 
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5"
                      style={{
                        background: vipThemeColor,
                        boxShadow: `0 0 12px ${vipThemeColor}`
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      VIP
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-bold relative"
                    style={{
                      color: isVip ? vipThemeColor : undefined,
                      textShadow: isVip ? `0 0 10px ${vipThemeColor}90` : undefined
                    }}
                  >
                    {job.company}
                  </p>
                  {isVip && (
                    <span 
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5"
                      style={{
                        background: vipThemeColor,
                        boxShadow: `0 0 12px ${vipThemeColor}`
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      VIP
                    </span>
                  )}
                </div>
              )}

            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onReport && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReport(job.id);
                  }}
                  title="Báo cáo công việc này"
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-red-500 transition-colors"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job.id);
                }}
                className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors group shrink-0"
              >
                <Bookmark
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${isBookmarked
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
    </div>
  );
}
