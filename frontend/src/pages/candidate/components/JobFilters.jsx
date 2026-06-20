import { Search, MapPin, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

const VIETNAM_CITIES = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Thành phố Cần Thơ",
  "Thành phố Đà Nẵng",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Thành phốHà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Thành phô Hải Phòng",
  "Thành phố Hồ Chí Minh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Nam",
  "Quảng Ninh",
  "Thanh Hóa",
  "Thành phố Huế"
];

/**
 * JobFilters Component
 * Sidebar filter options for candidates searching for jobs.
 */
export function JobFilters({
  showFilters,
  onHideFilters,
  salaryRange,
  onSalaryRangeChange,
  search,
  onSearchChange,
  location,
  onLocationChange,
  selectedFields,
  onFieldsChange,
  selectedExperiences,
  onExperiencesChange,
  selectedFormats,
  onFormatsChange,
  onClearFilters
}) {
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCitiesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCities = VIETNAM_CITIES.filter(city =>
    city.toLowerCase().includes((location || "").toLowerCase())
  );

  return (
    <aside
      className={`${showFilters ? "w-full lg:w-80 shrink-0 opacity-100 p-6 border" : "w-0 overflow-hidden p-0 border-0 opacity-0 pointer-events-none"
        } transition-all duration-300 h-fit bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border-gray-100 dark:border-white/5 rounded-3xl space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Bộ Lọc</h2>
        <button
          onClick={onHideFilters}
          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="flex-1 outline-none bg-transparent text-sm dark:text-slate-300 text-gray-700"
          />
        </div>
        <div ref={cityDropdownRef} className="relative">
          <div className="flex items-center gap-2 dark:bg-slate-800/50 bg-gray-50 p-2.5 rounded-xl border dark:border-white/5 border-gray-100 focus-within:border-[#0ea5e9] transition-colors">
            <MapPin className="w-5 h-5 dark:text-slate-500 text-gray-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value);
                setShowCitiesDropdown(true);
              }}
              onFocus={() => setShowCitiesDropdown(true)}
              placeholder="Địa điểm..."
              className="flex-1 outline-none bg-transparent text-sm dark:text-slate-300 text-gray-700"
            />
            {location && (
              <button
                type="button"
                onClick={() => {
                  onLocationChange("");
                  setShowCitiesDropdown(false);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
              </button>
            )}
          </div>

          {showCitiesDropdown && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white/95 dark:bg-slate-900/95 border dark:border-white/10 border-gray-100 rounded-xl shadow-xl backdrop-blur-md divide-y divide-gray-50 dark:divide-white/5 py-1">
              {filteredCities.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 dark:text-slate-500 text-center font-medium">
                  Không tìm thấy địa điểm
                </div>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onLocationChange(city);
                      setShowCitiesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9] transition-colors cursor-pointer block"
                  >
                    {city}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Field Category Filter */}
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-semibold dark:text-slate-200 text-gray-800 transition-colors cursor-pointer">
          <span>Lĩnh Vực</span>
          <ChevronDown className="w-5 h-5" />
        </Collapsible.Trigger>
        <Collapsible.Content className="space-y-3 mt-3">
          {["IT", "Marketing", "Design", "Finance", "Sales"].map((field) => (
            <div key={field} className="flex items-center gap-3">
              <Checkbox.Root
                className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center cursor-pointer"
                id={field}
                checked={selectedFields.includes(field)}
                onCheckedChange={() => {
                  if (selectedFields.includes(field)) {
                    onFieldsChange(selectedFields.filter(f => f !== field));
                  } else {
                    onFieldsChange([...selectedFields, field]);
                  }
                }}
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
          className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
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
        <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-semibold dark:text-slate-200 text-gray-800 transition-colors cursor-pointer">
          <span>Kinh Nghiệm</span>
          <ChevronDown className="w-5 h-5" />
        </Collapsible.Trigger>
        <Collapsible.Content className="space-y-3 mt-3">
          {["0-1 năm", "1-3 năm", "3-5 năm", "5+ năm"].map((exp) => (
            <div key={exp} className="flex items-center gap-3">
              <Checkbox.Root
                className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center cursor-pointer"
                id={exp}
                checked={selectedExperiences.includes(exp)}
                onCheckedChange={() => {
                  if (selectedExperiences.includes(exp)) {
                    onExperiencesChange(selectedExperiences.filter(e => e !== exp));
                  } else {
                    onExperiencesChange([...selectedExperiences, exp]);
                  }
                }}
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
        <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] font-semibold dark:text-slate-200 text-gray-800 transition-colors cursor-pointer">
          <span>Hình Thức</span>
          <ChevronDown className="w-5 h-5" />
        </Collapsible.Trigger>
        <Collapsible.Content className="space-y-3 mt-3">
          {["Full-time", "Part-time", "Remote", "Hybrid", "Office"].map((type) => (
            <div key={type} className="flex items-center gap-3">
              <Checkbox.Root
                className="w-5 h-5 border-2 dark:border-slate-600 border-gray-300 rounded dark:bg-slate-800 bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors flex items-center justify-center cursor-pointer"
                id={type}
                checked={selectedFormats.includes(type)}
                onCheckedChange={() => {
                  if (selectedFormats.includes(type)) {
                    onFormatsChange(selectedFormats.filter(t => t !== type));
                  } else {
                    onFormatsChange([...selectedFormats, type]);
                  }
                }}
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

      <button
        onClick={onClearFilters}
        className="w-full py-2 text-[#0ea5e9] hover:underline text-sm font-semibold transition-all cursor-pointer"
      >
        Xóa bộ lọc
      </button>
    </aside>
  );
}
