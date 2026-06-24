import { ChevronDown } from "lucide-react";

/**
 * FilterSelect - A styled select dropdown component with Ocean Blue theme.
 * Replaces native browser <select> appearance with a polished, branded UI.
 *
 * @param {string} value - Currently selected value
 * @param {function} onChange - Change handler (receives event)
 * @param {Array<{value: string, label: string}>} options - Dropdown options
 * @param {string} [className] - Optional extra classes
 */
export function FilterSelect({ value, onChange, options = [], className = "" }) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="
          appearance-none
          pl-3.5 pr-9 py-2
          bg-white
          border border-slate-200
          rounded-xl
          text-xs font-semibold text-slate-700
          cursor-pointer
          focus:outline-none
          focus:border-[#0ea5e9]
          focus:ring-2 focus:ring-[#0ea5e9]/15
          hover:border-[#38bdf8]
          transition-all duration-200
          shadow-sm
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom chevron icon — replaces native browser arrow */}
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
      />
    </div>
  );
}
