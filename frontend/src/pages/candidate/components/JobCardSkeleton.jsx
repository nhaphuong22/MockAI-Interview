export function JobCardSkeleton() {
  return (
    <div className="relative bg-white/70 dark:bg-[#0a0f1c]/60 backdrop-blur-md rounded-2xl p-6 border border-gray-100 dark:border-white/5 animate-pulse">
      <div className="flex gap-4">
        {/* Logo Skeleton */}
        <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-slate-800 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 space-y-2">
              {/* Title Skeleton */}
              <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
              {/* Company Skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
            {/* Bookmark Skeleton */}
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-800 shrink-0" />
          </div>

          {/* Meta Tags Skeleton */}
          <div className="flex gap-3 mb-4">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16" />
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-12" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-14" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex justify-between border-t border-gray-100/50 dark:border-white/5 pt-3">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
