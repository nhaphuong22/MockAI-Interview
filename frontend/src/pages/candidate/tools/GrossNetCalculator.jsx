import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toolApi } from "../../../api/toolApi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  DollarSign, Users, ShieldAlert, Sparkles, ArrowRight,
  TrendingUp, Info, Calculator, CreditCard 
} from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#0ea5e9", "#f97316", "#ef4444"];

export default function GrossNetCalculator() {
  const [grossSalary, setGrossSalary] = useState("");
  const [displaySalary, setDisplaySalary] = useState("");
  const [dependents, setDependents] = useState(0);
  const [insuranceOption, setInsuranceOption] = useState("FULL"); // "FULL" or "CUSTOM"
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState("");
  const [displayInsuranceSalary, setDisplayInsuranceSalary] = useState("");
  const [region, setRegion] = useState("I"); // "I", "II", "III", "IV"
  const [result, setResult] = useState(null);

  const calculateMutation = useMutation({
    mutationFn: (data) => toolApi.calculateSalary(data),
    onSuccess: (res) => {
      if (res?.success) {
        setResult(res.data);
      }
    }
  });

  const handleSalaryChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setGrossSalary(rawValue);
    if (rawValue) {
      setDisplaySalary(new Intl.NumberFormat("vi-VN").format(rawValue));
    } else {
      setDisplaySalary("");
    }
  };

  const handleInsuranceSalaryChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setCustomInsuranceSalary(rawValue);
    if (rawValue) {
      setDisplayInsuranceSalary(new Intl.NumberFormat("vi-VN").format(rawValue));
    } else {
      setDisplayInsuranceSalary("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!grossSalary || parseFloat(grossSalary) <= 0) return;
    
    calculateMutation.mutate({
      grossSalary: parseFloat(grossSalary),
      dependents: parseInt(dependents) || 0,
      insuranceSalaryOption: insuranceOption,
      customInsuranceSalary: insuranceOption === "CUSTOM" ? parseFloat(customInsuranceSalary) : 0,
      region
    });
  };

  const formatVND = (value) => {
    if (value == null) return "0";
    return new Intl.NumberFormat("vi-VN").format(value) + " đ";
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn Donut
  const getChartData = () => {
    if (!result) return [];
    return [
      { name: "Lương Net (Thực nhận)", value: result.netSalary },
      { name: "Bảo hiểm bắt buộc", value: result.totalInsuranceEmployee },
      { name: "Thuế TNCN", value: result.tax }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* CỘT TRÁI: FORM NHẬP LIỆU */}
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
          <Calculator className="w-5 h-5 text-[#0ea5e9]" />
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wide">Nhập thông tin lương</h2>
        </div>

        {/* Lương Gross */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
            <DollarSign size={16} className="text-[#0ea5e9]" />
            Lương Gross (Lương trước thuế)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ví dụ: 25.000.000"
              value={displaySalary}
              onChange={handleSalaryChange}
              className="w-full pl-4 pr-12 py-3 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-800 dark:text-white font-bold"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">VND</span>
          </div>
        </div>

        {/* Số người phụ thuộc */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
            <Users size={16} className="text-[#0ea5e9]" />
            Số người phụ thuộc
          </label>
          <input
            type="number"
            min="0"
            value={dependents}
            onChange={(e) => setDependents(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-800 dark:text-white font-bold"
          />
        </div>

        {/* Chọn Vùng */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
            <Info size={16} className="text-[#0ea5e9]" />
            Vùng áp dụng lương tối thiểu
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["I", "II", "III", "IV"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRegion(v)}
                className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer text-center ${
                  region === v
                    ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                    : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                Vùng {v}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 italic leading-relaxed">
            * Vùng I: 4.96M, Vùng II: 4.41M, Vùng III: 3.86M, Vùng IV: 3.45M (dùng để tính mức trần BHTN tối đa).
          </div>
        </div>

        {/* Tùy chọn đóng bảo hiểm */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
            <CreditCard size={16} className="text-[#0ea5e9]" />
            Đóng bảo hiểm dựa trên
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInsuranceOption("FULL")}
              className={`py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all ${
                insuranceOption === "FULL"
                  ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                  : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              Toàn bộ lương Gross
            </button>
            <button
              type="button"
              onClick={() => setInsuranceOption("CUSTOM")}
              className={`py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all ${
                insuranceOption === "CUSTOM"
                  ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                  : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              Mức lương tự chọn
            </button>
          </div>
        </div>

        {/* Nhập lương đóng bảo hiểm tùy chọn */}
        {insuranceOption === "CUSTOM" && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400">
              Lương đóng bảo hiểm (VND)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 10.000.000"
              value={displayInsuranceSalary}
              onChange={handleInsuranceSalaryChange}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-800 dark:text-white font-bold"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={calculateMutation.isPending}
          className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20 flex justify-center items-center gap-2 cursor-pointer"
        >
          {calculateMutation.isPending ? "Đang tính..." : "Tính Lương Net"}
        </button>
      </form>

      {/* CỘT PHẢI: KẾT QUẢ HIỂN THỊ */}
      <div className="lg:col-span-7 space-y-6">
        {result ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tóm tắt Lương Net */}
            <div className="bg-gradient-to-r from-sky-500 to-[#0284c7] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-85">LƯƠNG NET THỰC NHẬN</p>
              <h3 className="text-3xl font-black mt-2 font-mono">{formatVND(result.netSalary)}</h3>
              <p className="text-[11px] mt-2 opacity-80 flex items-center gap-1">
                <Info size={12} />
                Đã trừ {formatVND(result.totalInsuranceEmployee)} bảo hiểm và {formatVND(result.tax)} thuế TNCN.
              </p>
            </div>

            {/* Biểu đồ phân bổ lương */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-lg">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Biểu đồ phân bổ lương</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatVND(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-gray-300">
                      <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
                      Net Salary (Thực nhận)
                    </span>
                    <span className="font-bold text-slate-950 dark:text-white font-mono">
                      {((result.netSalary / result.grossSalary) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-gray-300">
                      <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                      Bảo hiểm bắt buộc
                    </span>
                    <span className="font-bold text-slate-950 dark:text-white font-mono">
                      {((result.totalInsuranceEmployee / result.grossSalary) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-gray-300">
                      <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      Thuế TNCN
                    </span>
                    <span className="font-bold text-slate-950 dark:text-white font-mono">
                      {((result.tax / result.grossSalary) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết các khoản đóng Bảo hiểm */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#0ea5e9]" /> Chi tiết bảo hiểm bắt buộc (NLĐ đóng 10.5%)
                </h4>
              </div>
              <div className="p-5 divide-y divide-slate-100 dark:divide-white/5">
                <div className="py-2.5 flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Bảo hiểm xã hội (BHXH - 8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatVND(result.employeeInsurance.bhxh)}</span>
                </div>
                <div className="py-2.5 flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Bảo hiểm y tế (BHYT - 1.5%)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatVND(result.employeeInsurance.bhyt)}</span>
                </div>
                <div className="py-2.5 flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Bảo hiểm thất nghiệp (BHTN - 1%)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatVND(result.employeeInsurance.bhtn)}</span>
                </div>
              </div>
            </div>

            {/* Chi tiết Thuế lũy tiến */}
            {result.taxSteps?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500" /> Biểu thuế lũy tiến từng phần
                  </h4>
                </div>
                <div className="p-5 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-black uppercase">
                        <th className="pb-2">Bậc thuế</th>
                        <th className="pb-2">Thu nhập tính thuế</th>
                        <th className="pb-2 text-center">Thuế suất</th>
                        <th className="pb-2 text-right">Tiền thuế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300 font-bold">
                      {result.taxSteps.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="py-3">{step.label}</td>
                          <td className="py-3 font-mono">{formatVND(step.taxableAmount)}</td>
                          <td className="py-3 text-center text-rose-500 font-black">{step.rate}%</td>
                          <td className="py-3 text-right font-mono text-slate-900 dark:text-white">{formatVND(step.taxAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTA Phễu chuyển đổi Premium */}
            <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-black text-sky-900 dark:text-sky-400 flex items-center justify-center md:justify-start gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Đánh giá cơ hội deal lương của bạn?
                </h4>
                <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                  Tải CV của bạn lên hệ thống để AI tự động phân tích kỹ năng và định giá chính xác mức lương phù hợp nhất trên thị trường!
                </p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-1 px-5 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all shadow-md shrink-0 cursor-pointer"
              >
                Phân tích CV ngay <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/10 h-full">
            <Calculator className="w-16 h-16 opacity-20 mb-4 animate-bounce" />
            <span className="font-bold text-sm">Vui lòng nhập mức lương Gross ở cột bên trái và bấm tính toán.</span>
          </div>
        )}
      </div>
    </div>
  );
}
