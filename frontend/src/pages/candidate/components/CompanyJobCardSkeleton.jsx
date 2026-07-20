export function CompanyJobCardSkeleton() {
  return (
    <div className="relative rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/80 animate-pulse overflow-hidden">
      {/* Company Header Skeleton */}
      <div className="flex items-center gap-3.5 px-5 pt-5 pb-3.5 border-b border-slate-100 dark:border-white/5">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
        </div>
        <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
      </div>

      {/* Position rows Skeleton */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-full text-left px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-slate-800 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                <div className="flex gap-3 mb-3">
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-12" />
                </div>
                <div className="flex gap-1">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-12" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-16" />
                </div>
              </div>
              <div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 rounded shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
