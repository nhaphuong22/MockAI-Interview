import { Search, MapPin, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  "Thành phố Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Thành phố Hải Phòng",
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

const FIELD_OPTIONS = [
  { value: "all", label: "Tất cả lĩnh vực" },
  { value: "IT", label: "Công nghệ thông tin" },
  { value: "Marketing", label: "Marketing" },
  { value: "Design", label: "Thiết kế (Design)" },
  { value: "Finance", label: "Tài chính (Finance)" },
  { value: "Sales", label: "Bán hàng (Sales)" }
];

const SALARY_OPTIONS = [
  { value: "all", label: "Tất cả mức lương" },
  { value: "under_10", label: "Dưới 10 triệu" },
  { value: "10_15", label: "10 - 15 triệu" },
  { value: "15_20", label: "15 - 20 triệu" },
  { value: "20_25", label: "20 - 25 triệu" },
  { value: "25_30", label: "25 - 30 triệu" },
  { value: "30_50", label: "30 - 50 triệu" },
  { value: "over_50", label: "Trên 50 triệu" },
  { value: "negotiable", label: "Thỏa thuận" }
];

const EXPERIENCE_OPTIONS = [
  { value: "all", label: "Tất cả kinh nghiệm" },
  { value: "none", label: "Chưa có kinh nghiệm" },
  { value: "under_1", label: "Dưới 1 năm" },
  { value: "1", label: "1 năm" },
  { value: "2", label: "2 năm" },
  { value: "3", label: "3 năm" },
  { value: "4", label: "4 năm" },
  { value: "5", label: "5 năm" },
  { value: "over_5", label: "Trên 5 năm" }
];

const LEVEL_OPTIONS = [
  { value: "all", label: "Tất cả cấp bậc" },
  { value: "intern", label: "Thực tập sinh" },
  { value: "staff", label: "Nhân viên" },
  { value: "leader", label: "Trưởng nhóm" },
  { value: "manager", label: "Trưởng phòng / Quản lý" },
  { value: "director", label: "Giám đốc và trên" }
];

const FORMAT_OPTIONS = [
  { value: "all", label: "Tất cả hình thức" },
  { value: "fulltime", label: "Toàn thời gian (Full-time)" },
  { value: "parttime", label: "Bán thời gian (Part-time)" },
  { value: "internship", label: "Thực tập (Internship)" },
  { value: "remote", label: "Làm việc từ xa (Remote)" }
];

const GENDER_OPTIONS = [
  { value: "all", label: "Tất cả giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "no_requirement", label: "Không yêu cầu" }
];

export function JobSearchBanner({
  search,
  onSearchChange,
  location,
  onLocationChange,
  selectedField,
  onFieldChange,
  salarySelect,
  onSalarySelectChange,
  experienceSelect,
  onExperienceSelectChange,
  levelSelect,
  onLevelSelectChange,
  formatSelect,
  onFormatSelectChange,
  genderSelect,
  onGenderSelectChange,
  onClearFilters,
  onSearchSubmit
}) {
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'field', 'salary', 'experience', 'level', 'format', 'gender'
  
  const cityDropdownRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCitiesDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
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

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const handleSelectOption = (value, setter) => {
    setter(value);
    setActiveDropdown(null);
  };

  const hasAnyFilter = 
    selectedField !== "all" || 
    salarySelect !== "all" || 
    experienceSelect !== "all" || 
    levelSelect !== "all" ||
    formatSelect !== "all" ||
    genderSelect !== "all" ||
    search !== "" ||
    location !== "";

  // Get labels for active selections to display on buttons
  const getLabel = (options, value, defaultLabel) => {
    const found = options.find(opt => opt.value === value);
    return found && value !== "all" ? found.label : defaultLabel;
  };

  return (
    <div className="w-full space-y-4 mb-8">
      {/* Search Banner Container */}
      <div className="relative z-20 bg-gradient-to-r from-sky-600 to-sky-800 dark:from-slate-900 dark:via-[#0b1329] dark:to-slate-950 p-6 md:p-8 rounded-3xl border border-sky-500/20 dark:border-white/5 shadow-2xl text-white">
        {/* Background Blur Ornaments */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-[#0ea5e9]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 dark:bg-[#38bdf8]/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Tìm Kiếm Cơ Hội Việc Làm IT <span className="text-sky-200 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#0ea5e9] dark:to-[#38bdf8]">Mơ Ước</span>
            </h1>
            <p className="text-xs md:text-sm text-sky-100 dark:text-slate-400 font-medium mt-1.5">
              Khám phá hàng ngàn công việc chất lượng cao, phỏng vấn giả lập với AI và tối ưu hóa CV của bạn.
            </p>
          </div>

          {/* Main Search Input & Location Dropdown */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchSubmit) onSearchSubmit();
            }} 
            className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white dark:bg-white/5 dark:backdrop-blur-xl border border-slate-200/20 dark:border-white/10 p-3 rounded-2xl md:rounded-xl shadow-lg"
          >
            {/* Search Input */}
            <div className="md:col-span-6 flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/5 focus-within:border-[#0ea5e9]/60 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Vị trí tuyển dụng, kỹ năng, ngôn ngữ lập trình..."
                className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm text-slate-800 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div ref={cityDropdownRef} className="md:col-span-4 relative">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/5 focus-within:border-[#0ea5e9]/60 transition-colors h-full">
                <MapPin className="w-4 h-4 text-[#0ea5e9] shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    onLocationChange(e.target.value);
                    setShowCitiesDropdown(true);
                  }}
                  onFocus={() => setShowCitiesDropdown(true)}
                  placeholder="Chọn tỉnh, thành phố..."
                  className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm text-slate-800 dark:text-white"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => {
                      onLocationChange("");
                      setShowCitiesDropdown(false);
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showCitiesDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-2 max-h-52 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
                  {filteredCities.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center font-medium">
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
                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0ea5e9]/10 dark:hover:bg-[#0ea5e9]/20 hover:text-[#0ea5e9] dark:hover:text-white transition-colors block text-slate-700 dark:text-slate-300"
                      >
                        {city}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full h-full py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:brightness-105 active:scale-[0.98] text-white rounded-xl shadow-md font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Horizontal Dropdown Filters Bar */}
      <div ref={dropdownRef} className="relative z-10 flex flex-wrap items-center gap-2 p-4 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mr-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#0ea5e9]" />
          <span>Bộ lọc nâng cao:</span>
        </div>

        {/* 1. Lọc Lĩnh Vực Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("field")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedField !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(FIELD_OPTIONS, selectedField, "Lĩnh vực")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "field" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "field" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {FIELD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onFieldChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    selectedField === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Lọc Mức Lương Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("salary")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              salarySelect !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(SALARY_OPTIONS, salarySelect, "Mức lương")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "salary" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "salary" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {SALARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onSalarySelectChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    salarySelect === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Lọc Kinh Nghiệm Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("experience")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              experienceSelect !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(EXPERIENCE_OPTIONS, experienceSelect, "Kinh nghiệm")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "experience" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "experience" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onExperienceSelectChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    experienceSelect === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Lọc Cấp Bậc Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("level")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              levelSelect !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(LEVEL_OPTIONS, levelSelect, "Cấp bậc")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "level" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "level" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onLevelSelectChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    levelSelect === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Lọc Hình Thức Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("format")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              formatSelect !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(FORMAT_OPTIONS, formatSelect, "Hình thức")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "format" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "format" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onFormatSelectChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    formatSelect === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 6. Lọc Giới Tính Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("gender")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              genderSelect !== "all"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-[#38bdf8]"
                : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 dark:text-slate-300 text-gray-600 bg-white/50 dark:bg-slate-800/20"
            }`}
          >
            <span>{getLabel(GENDER_OPTIONS, genderSelect, "Giới tính")}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "gender" ? "rotate-180" : ""}`} />
          </button>

          {activeDropdown === "gender" && (
            <div className="absolute z-50 left-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-white/10 border-gray-100 rounded-xl shadow-2xl py-1 text-slate-700 dark:text-slate-300">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, onGenderSelectChange)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors block hover:bg-[#0ea5e9]/15 hover:text-[#0ea5e9] ${
                    genderSelect === opt.value ? "text-[#0ea5e9] bg-[#0ea5e9]/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nút Xóa Bộ Lọc */}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters();
            }}
            className="px-3 py-2 text-[#0ea5e9] hover:underline text-xs font-bold transition-all cursor-pointer ml-auto flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
}
