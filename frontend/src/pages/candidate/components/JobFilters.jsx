import { Search, MapPin, ChevronDown, X } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

/**
 * JobFilters Component
 * Sidebar filter options for candidates searching for jobs.
 */
export function JobFilters({ 
  showFilters, 
  onHideFilters, 
  salaryRange, 
  onSalaryRangeChange 
}) {
  return (
    <aside
      className={`${
        showFilters ? "w-80" : "w-0"
      } transition-all duration-300 overflow-hidden dark:bg-[#0a0f1c]/95 bg-white border-r dark:border-white/10 border-gray-200`}
    >
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Bộ Lọc</h2>
          <button
            onClick={onHideFilters}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-slate-300" />
          </button>
        </div>

        {/* Search & Location inputs */}
        <div>
          <div className="flex items-center gap-2 mb-3 dark:bg-slate-800/50 bg-gray-50 p-2.5 rounded-xl border dark:border-white/5 border-gray-100 focus-within:border-[#0ea5e9] transition-colors">
            <Search className="w-5 h-5 dark:text-slate-500 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              className="flex-1 outline-none bg-transparent text-sm dark:text-slate-300 text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 dark:bg-slate-800/50 bg-gray-50 p-2.5 rounded-xl border dark:border-white/5 border-gray-100 focus-within:border-[#0ea5e9] transition-colors">
            <MapPin className="w-5 h-5 dark:text-slate-500 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Địa điểm..."
              className="flex-1 outline-none bg-transparent text-sm dark:text-slate-300 text-gray-700"
            />
          </div>
        </div>

        {/* Field Category Filter */}
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-medium dark:text-slate-200 text-gray-800 transition-colors">
            <span>Lĩnh Vực</span>
            <ChevronDown className="w-5 h-5" />
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-3 mt-3">
            {["IT", "Marketing", "Design", "Finance", "Sales"].map((field) => (
              <div key={field} className="flex items-center gap-3">
                <Checkbox.Root
                  className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center"
                  id={field}
                >
                  <Checkbox.Indicator>
                    <Check className="w-4 h-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor={field} className="text-sm dark:text-slate-400 text-gray-500 cursor-pointer select-none">
                  {field}
                </label>
              </div>
            ))}
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Salary Range Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold dark:text-slate-200 text-gray-800">Mức Lương (triệu VND)</span>
            <span className="text-sm font-semibold text-[#0ea5e9]">
              {salaryRange[0]} - {salaryRange[1]}+
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={salaryRange}
            onValueChange={onSalaryRangeChange}
            max={50}
            min={10}
            step={5}
          >
            <Slider.Track className="dark:bg-slate-700 bg-gray-200 relative grow rounded-full h-1.5">
              <Slider.Range className="absolute bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 dark:bg-slate-800 bg-white border-2 border-[#0ea5e9] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-transform cursor-grab active:cursor-grabbing" />
            <Slider.Thumb className="block w-5 h-5 dark:bg-slate-800 bg-white border-2 border-[#0ea5e9] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-transform cursor-grab active:cursor-grabbing" />
          </Slider.Root>
        </div>

        {/* Experience Level Filter */}
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-medium dark:text-slate-200 text-gray-800 transition-colors">
            <span>Kinh Nghiệm</span>
            <ChevronDown className="w-5 h-5" />
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-3 mt-3">
            {["0-1 năm", "1-3 năm", "3-5 năm", "5+ năm"].map((exp) => (
              <div key={exp} className="flex items-center gap-3">
                <Checkbox.Root
                  className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center"
                  id={exp}
                >
                  <Checkbox.Indicator>
                    <Check className="w-4 h-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor={exp} className="text-sm dark:text-slate-400 text-gray-500 cursor-pointer select-none">
                  {exp}
                </label>
              </div>
            ))}
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Work Format Filter */}
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-medium dark:text-slate-200 text-gray-800 transition-colors">
            <span>Hình Thức</span>
            <ChevronDown className="w-5 h-5" />
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-3 mt-3">
            {["Full-time", "Part-time", "Remote", "Hybrid", "Office"].map((type) => (
              <div key={type} className="flex items-center gap-3">
                <Checkbox.Root
                  className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center"
                  id={type}
                >
                  <Checkbox.Indicator>
                    <Check className="w-4 h-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor={type} className="text-sm dark:text-slate-400 text-gray-500 cursor-pointer select-none">
                  {type}
                </label>
              </div>
            ))}
          </Collapsible.Content>
        </Collapsible.Root>

        <button className="w-full py-2 text-[#0ea5e9] hover:underline text-sm font-semibold transition-all">
          Xóa bộ lọc
        </button>
      </div>
    </aside>
  );
}
