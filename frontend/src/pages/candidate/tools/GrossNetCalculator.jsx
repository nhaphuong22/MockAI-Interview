import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toolApi } from "../../../api/toolApi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  DollarSign, Users, ShieldAlert, Sparkles, ArrowRight,
  TrendingUp, Info, Calculator, CreditCard, RotateCcw,
  BookOpen, HelpCircle, CheckCircle2, Building2, User, ArrowLeftRight, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#0ea5e9", "#f97316", "#ef4444"];

export default function GrossNetCalculator() {
  const [calcType, setCalcType] = useState("GROSS_TO_NET"); // "GROSS_TO_NET" hoặc "NET_TO_GROSS"
  const [salaryInput, setSalaryInput] = useState("");
  const [displaySalary, setDisplaySalary] = useState("");
  const [dependents, setDependents] = useState(0);
  const [insuranceOption, setInsuranceOption] = useState("FULL"); // "FULL" hoặc "CUSTOM"
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState("");
  const [displayInsuranceSalary, setDisplayInsuranceSalary] = useState("");
  const [region, setRegion] = useState("I"); // "I", "II", "III", "IV"
  const [result, setResult] = useState(null);
  
  // Accordion state cho phần cẩm nang đọc thông tin
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
    setSalaryInput(rawValue);
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

  const handleReset = () => {
    setSalaryInput("");
    setDisplaySalary("");
    setDependents(0);
    setInsuranceOption("FULL");
    setCustomInsuranceSalary("");
    setDisplayInsuranceSalary("");
    setRegion("I");
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!salaryInput || parseFloat(salaryInput) <= 0) return;
    
    calculateMutation.mutate({
      type: calcType,
      grossSalary: calcType === "GROSS_TO_NET" ? parseFloat(salaryInput) : 0,
      netSalaryInput: calcType === "NET_TO_GROSS" ? parseFloat(salaryInput) : 0,
      dependents: parseInt(dependents) || 0,
      insuranceSalaryOption: insuranceOption,
      customInsuranceSalary: insuranceOption === "CUSTOM" ? parseFloat(customInsuranceSalary) : 0,
      region
    });
  };

  const formatVND = (value) => {
    if (value == null) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " đ";
  };

  const getChartData = () => {
    if (!result) return [];
    return [
      { name: "Lương Net (Thực nhận)", value: result.netSalary },
      { name: "Bảo hiểm bắt buộc", value: result.totalInsuranceEmployee },
      { name: "Thuế TNCN", value: result.tax }
    ].filter(item => item.value > 0);
  };

  const faqs = [
    {
      q: "Lương Gross và Lương Net là gì?",
      a: "Lương Gross là tổng thu nhập mà công ty chi trả cho bạn hàng tháng trước khi trừ các khoản Bảo hiểm bắt buộc và Thuế thu nhập cá nhân (TNCN). Lương Net là số tiền thực tế bạn nhận về tài khoản ngân hàng sau khi đã khấu trừ hết các chi phí thuế và bảo hiểm."
    },
    {
      q: "Nên thỏa thuận Lương Gross hay Lương Net khi đi phỏng vấn?",
      a: "Các chuyên gia tuyển dụng khuyến nghị bạn nên đàm phán Lương Gross. Khi đàm phán Lương Gross, bạn chủ động nắm rõ khoản tiền đóng bảo hiểm xã hội, thuế TNCN và công ty sẽ không thể cắt giảm tiền bảo hiểm của bạn. Lương Net đôi khi có rủi ro doanh nghiệp khai báo mức bảo hiểm thấp hơn để giảm chi phí."
    },
    {
      q: "Mức lương cơ sở năm 2024 - 2026 hiện nay là bao nhiêu?",
      a: "Theo Nghị định 73/2024/NĐ-CP, mức lương cơ sở được nâng lên 2.340.000 đồng/tháng áp dụng từ ngày 01/07/2024. Mức trần đóng BHXH và BHYT tối đa bằng 20 lần mức lương cơ sở (tương đương 46.800.000 đồng/tháng)."
    },
    {
      q: "Mức giảm trừ gia cảnh hiện nay quy định thế nào?",
      a: "Theo Nghị quyết 954/2020/UBTVQH14, mức giảm trừ đối với đối tượng nộp thuế bản thân là 11 triệu đồng/tháng (132 triệu đồng/năm); Mức giảm trừ đối với mỗi người phụ thuộc là 4,4 triệu đồng/tháng."
    },
    {
      q: "Ai được tính là Người phụ thuộc để giảm trừ gia cảnh?",
      a: "Người phụ thuộc bao gồm: Con dưới 18 tuổi hoặc con trên 18 tuổi bị khuyết tật/đang đi học đại học không có thu nhập (hoặc thu nhập dưới 1 triệu/tháng); Vợ/chồng, cha mẹ đẻ, cha mẹ vợ/chồng hết tuổi lao động hoặc không có khả năng lao động."
    }
  ];

  return (
    <div className="space-y-12">
      {/* 🟢 KHU VỰC CÔNG CỤ TÍNH LƯƠNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white dark:bg-slate-900 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0ea5e9]" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wide">Nhập thông tin lương</h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-[#0ea5e9] transition-colors cursor-pointer"
            >
              <RotateCcw size={14} /> Đặt lại
            </button>
          </div>

          {/* TAB CHỌN CHẾ ĐỘ TÍNH (GROSS -> NET HAY NET -> GROSS) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowLeftRight size={14} className="text-[#0ea5e9]" /> Chế độ chuyển đổi
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setCalcType("GROSS_TO_NET")}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                  calcType === "GROSS_TO_NET"
                    ? "bg-[#0ea5e9] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                GROSS ➔ NET
              </button>
              <button
                type="button"
                onClick={() => setCalcType("NET_TO_GROSS")}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                  calcType === "NET_TO_GROSS"
                    ? "bg-[#0ea5e9] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                NET ➔ GROSS
              </button>
            </div>
          </div>

          {/* Ô Nhập Lương */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign size={16} className="text-[#0ea5e9]" />
              {calcType === "GROSS_TO_NET" ? "Thu nhập tháng (Lương Gross)" : "Thu nhập thực nhận (Lương Net)"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={calcType === "GROSS_TO_NET" ? "Ví dụ: 25.000.000" : "Ví dụ: 20.000.000"}
                value={displaySalary}
                onChange={handleSalaryChange}
                className="w-full pl-4 pr-14 py-3 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-800 dark:text-white font-bold"
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

          {/* Lương đóng bảo hiểm */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
              <CreditCard size={16} className="text-[#0ea5e9]" />
              Mức lương đóng bảo hiểm
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInsuranceOption("FULL")}
                className={`py-3 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  insuranceOption === "FULL"
                    ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                    : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                Trên lương chính thức
              </button>
              <button
                type="button"
                onClick={() => setInsuranceOption("CUSTOM")}
                className={`py-3 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  insuranceOption === "CUSTOM"
                    ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                    : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                Mức khác
              </button>
            </div>
          </div>

          {/* Nhập lương đóng bảo hiểm tùy chọn */}
          {insuranceOption === "CUSTOM" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400">
                Mức lương đóng bảo hiểm khác (VND)
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

          {/* Chọn Vùng áp dụng lương tối thiểu */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
              <Info size={16} className="text-[#0ea5e9]" />
              Vùng áp dụng lương tối thiểu
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "I", val: "4.96M" },
                { id: "II", val: "4.41M" },
                { id: "III", val: "3.86M" },
                { id: "IV", val: "3.45M" }
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setRegion(v.id)}
                  className={`py-2 px-2 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                    region === v.id
                      ? "border-[#0ea5e9] bg-sky-50/50 dark:bg-sky-950/20 text-[#0ea5e9]"
                      : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span>Vùng {v.id}</span>
                  <span className="text-[10px] opacity-75">{v.val}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thông số quy định tham chiếu */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/5 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex justify-between font-medium">
              <span>Lương cơ sở (Từ 01/07/2024):</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">2.340.000 đ</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Giảm trừ bản thân:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">11.000.000 đ</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Giảm trừ người phụ thuộc:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">4.400.000 đ/người</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={calculateMutation.isPending}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20 flex justify-center items-center gap-2 cursor-pointer"
          >
            {calculateMutation.isPending ? "Đang tính..." : (calcType === "GROSS_TO_NET" ? "TÍNH LƯƠNG NET" : "TÍNH LƯƠNG GROSS")}
          </button>
        </form>

        {/* CỘT PHẢI: KẾT QUẢ HIỂN THỊ */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Tóm tắt Lương Net / Gross */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-sky-500 to-[#0284c7] p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-85">LƯƠNG NET (THỰC NHẬN)</p>
                  <h3 className="text-2xl lg:text-3xl font-black mt-1 font-mono">{formatVND(result.netSalary)}</h3>
                </div>
                <div className="bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-white/10 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">LƯƠNG GROSS (QUY ĐỔI)</p>
                  <h3 className="text-2xl lg:text-3xl font-black mt-1 font-mono">{formatVND(result.grossSalary)}</h3>
                </div>
              </div>

              {/* BẢNG DIỄN GIẢI CHI TIẾT TỪNG BƯỚC TÍNH (STEP BY STEP) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ea5e9]" /> Diễn giải chi tiết các bước tính
                  </h4>
                  <span className="text-[10px] font-semibold px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-[#0ea5e9] rounded-full">
                    {calcType === "GROSS_TO_NET" ? "Gross ➔ Net" : "Net ➔ Gross"}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  <div className="p-3.5 flex justify-between items-center bg-sky-50/40 dark:bg-sky-950/10 font-bold text-slate-800 dark:text-slate-200">
                    <span>Lương GROSS</span>
                    <span className="font-mono text-sm text-[#0ea5e9]">{formatVND(result.grossSalary)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center text-slate-600 dark:text-slate-400 pl-6">
                    <span>- Bảo hiểm xã hội (BHXH - 8%)</span>
                    <span className="font-mono font-semibold text-rose-500">-{formatVND(result.employeeInsurance.bhxh)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center text-slate-600 dark:text-slate-400 pl-6">
                    <span>- Bảo hiểm y tế (BHYT - 1.5%)</span>
                    <span className="font-mono font-semibold text-rose-500">-{formatVND(result.employeeInsurance.bhyt)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center text-slate-600 dark:text-slate-400 pl-6">
                    <span>- Bảo hiểm thất nghiệp (BHTN - 1%)</span>
                    <span className="font-mono font-semibold text-rose-500">-{formatVND(result.employeeInsurance.bhtn)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50/60 dark:bg-slate-800/20">
                    <span>= Thu nhập trước thuế</span>
                    <span className="font-mono">{formatVND(result.incomeBeforeDeduction)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center text-slate-600 dark:text-slate-400 pl-6">
                    <span>- Giảm trừ gia cảnh bản thân</span>
                    <span className="font-mono font-semibold">{formatVND(result.deductions.personal)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center text-slate-600 dark:text-slate-400 pl-6">
                    <span>- Giảm trừ người phụ thuộc ({dependents} người)</span>
                    <span className="font-mono font-semibold">{formatVND(result.deductions.dependents)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50/60 dark:bg-slate-800/20">
                    <span>= Thu nhập tính thuế</span>
                    <span className="font-mono">{formatVND(result.taxableIncome)}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center font-bold text-rose-600 dark:text-rose-400">
                    <span>- Thuế thu nhập cá nhân (TNCN)</span>
                    <span className="font-mono">-{formatVND(result.tax)}</span>
                  </div>

                  <div className="p-4 flex justify-between items-center font-black text-sm bg-gradient-to-r from-sky-500/10 to-sky-600/10 text-slate-900 dark:text-white border-t border-sky-200 dark:border-sky-800">
                    <span>= LƯƠNG NET (THỰC NHẬN)</span>
                    <span className="font-mono text-lg text-[#0ea5e9]">{formatVND(result.netSalary)}</span>
                  </div>
                </div>
              </div>

              {/* BẢNG SO SÁNH NGHĨA VỤ NGUỜI LAO ĐỘNG & DOANH NGHIỆP (DOANH NGHIỆP TRẢ) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0ea5e9]" /> Quy đổi Chi phí Người sử dụng lao động (Doanh nghiệp) trả
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <User size={14} className="text-[#0ea5e9]" /> Người lao động đóng (10.5%)
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between"><span>BHXH (8%):</span> <span className="font-mono font-semibold">{formatVND(result.employeeInsurance.bhxh)}</span></div>
                      <div className="flex justify-between"><span>BHYT (1.5%):</span> <span className="font-mono font-semibold">{formatVND(result.employeeInsurance.bhyt)}</span></div>
                      <div className="flex justify-between"><span>BHTN (1%):</span> <span className="font-mono font-semibold">{formatVND(result.employeeInsurance.bhtn)}</span></div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                        <span>Tổng NLĐ đóng:</span>
                        <span className="font-mono text-[#0ea5e9]">{formatVND(result.totalInsuranceEmployee)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50/50 dark:bg-sky-950/20 p-4 rounded-xl space-y-2 border border-sky-100 dark:border-sky-900/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300">
                      <Building2 size={14} className="text-[#0ea5e9]" /> Doanh nghiệp đóng thêm (21.5%)
                    </div>
                    <div className="space-y-1 text-xs text-sky-800 dark:text-sky-300">
                      <div className="flex justify-between"><span>BHXH (17.5%):</span> <span className="font-mono font-semibold">{formatVND(result.employerInsurance.bhxh)}</span></div>
                      <div className="flex justify-between"><span>BHYT (3%):</span> <span className="font-mono font-semibold">{formatVND(result.employerInsurance.bhyt)}</span></div>
                      <div className="flex justify-between"><span>BHTN (1%):</span> <span className="font-mono font-semibold">{formatVND(result.employerInsurance.bhtn)}</span></div>
                      <div className="flex justify-between pt-1 border-t border-sky-200 dark:border-sky-800 font-bold text-sky-950 dark:text-sky-200">
                        <span>Tổng chi phí Doanh nghiệp trả:</span>
                        <span className="font-mono text-[#0ea5e9]">{formatVND(result.totalCostEmployer)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biểu đồ phân bổ lương */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-lg">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Biểu đồ phân bổ cơ cấu thu nhập</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-gray-300">
                        <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
                        Lương Net (Thực nhận)
                      </span>
                      <span className="font-bold text-slate-950 dark:text-white font-mono">
                        {((result.netSalary / result.grossSalary) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-gray-300">
                        <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                        Bảo hiểm bắt buộc (NLĐ)
                      </span>
                      <span className="font-bold text-slate-950 dark:text-white font-mono">
                        {((result.totalInsuranceEmployee / result.grossSalary) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
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

              {/* Chi tiết Thuế lũy tiến 7 Bậc */}
              {result.taxSteps?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-rose-500" /> Chi tiết thuế thu nhập cá nhân (TNCN) theo biểu thuế lũy tiến
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
                    <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Bạn muốn nâng mức thu nhập hiện tại?
                  </h4>
                  <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                    Luyện tập phỏng vấn ảo với AI 3D chuyên sâu để gia tăng sự tự tin và đàm phán mức lương vượt trội trong kỳ phỏng vấn tới!
                  </p>
                </div>
                <Link
                  to="/interview-setup"
                  className="flex items-center gap-1.5 px-5 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Luyện phỏng vấn AI ngay <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/10 h-full">
              <Calculator className="w-16 h-16 opacity-20 mb-4 animate-bounce" />
              <span className="font-bold text-sm">Vui lòng nhập mức thu nhập ở cột bên trái và bấm tính toán.</span>
            </div>
          )}
        </div>
      </div>

      {/* 🟢 KHU VỰC THÔNG TIN VÍ DỤ VÀ CẨM NANG HƯỚNG DẪN DÀNH CHO NGƯỜI DÙNG ĐỌC (TOPCV CLONE CONTENT) */}
      <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-wide flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0ea5e9]" /> Hướng Dẫn & Kiến Thức Về Lương Gross - Net
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Tổng hợp thông tin chi tiết về khái niệm, công thức quy đổi, ví dụ minh họa và biểu thuế thu nhập cá nhân mới nhất năm 2024 - 2026.
          </p>
        </div>

        {/* 1. VÍ DỤ MINH HỌA TÍNH LƯƠNG THỰC TẾ (STEP BY STEP EXAMPLE) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 dark:border-white/5 pb-3">
            <Sparkles className="w-5 h-5 text-[#0ea5e9]" /> Ví dụ minh họa tính Lương Gross sang Net thực tế
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Giả sử bạn có mức thu nhập <strong>Lương Gross = 20.000.000 VNĐ/tháng</strong>, đóng bảo hiểm trên lương chính thức, đăng ký <strong>1 người phụ thuộc</strong> và làm việc tại doanh nghiệp thuộc <strong>Vùng I (Hà Nội / TP.HCM)</strong>. Các bước diễn giải tính toán như sau:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 font-mono text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5">
              <div>1. Lương GROSS: <strong>20.000.000 đ</strong></div>
              <div>2. Bảo hiểm bắt buộc (10.5%):</div>
              <div className="pl-4 text-slate-500 dark:text-slate-400">- BHXH (8%): 20.000.000 x 8% = 1.600.000 đ</div>
              <div className="pl-4 text-slate-500 dark:text-slate-400">- BHYT (1.5%): 20.000.000 x 1.5% = 300.000 đ</div>
              <div className="pl-4 text-slate-500 dark:text-slate-400">- BHTN (1%): 20.000.000 x 1% = 200.000 đ</div>
              <div className="pl-4 font-bold text-[#0ea5e9]">➔ Tổng bảo hiểm NLĐ đóng: 2.100.000 đ</div>
              <div>3. Thu nhập trước thuế: 20.000.000 - 2.100.000 = <strong>17.900.000 đ</strong></div>
              <div>4. Giảm trừ gia cảnh:</div>
              <div className="pl-4 text-slate-500 dark:text-slate-400">- Bản thân: 11.000.000 đ</div>
              <div className="pl-4 text-slate-500 dark:text-slate-400">- 1 người phụ thuộc: 4.400.000 đ</div>
              <div className="pl-4 font-bold text-[#0ea5e9]">➔ Tổng giảm trừ: 15.400.000 đ</div>
              <div>5. Thu nhập tính thuế: 17.900.000 - 15.400.000 = <strong>2.500.000 đ</strong></div>
              <div>6. Thuế TNCN phải nộp (Bậc 1 - 5%): 2.500.000 x 5% = <strong>125.000 đ</strong></div>
              <div className="pt-2 text-sm font-bold text-[#0ea5e9]">7. LƯƠNG NET THỰC NHẬN: 20.000.000 - 2.100.000 - 125.000 = 17.775.000 đ</div>
            </div>
          </div>
        </div>

        {/* 2. CÁC KHÁI NIỆM VÀ QUY ĐỊNH PHÁP LUẬT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-md space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[#0ea5e9]">
              Lương Gross là gì?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Lương Gross là tổng thu nhập mà doanh nghiệp chi trả cho người lao động mỗi kỳ lương, đã bao gồm cả lương thực nhận, tiền đóng bảo hiểm xã hội (10.5%) và thuế thu nhập cá nhân. Khi thỏa thuận lương Gross, người lao động phải tự trích một phần để thực hiện nghĩa vụ đóng bảo hiểm và thuế theo quy định.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-md space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[#0ea5e9]">
              Lương Net là gì?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Lương Net là khoản tiền thực tế người lao động sẽ nhận được về tài khoản hàng tháng sau khi công ty đã trừ hết tiền đóng BHXH, BHYT, BHTN và thuế TNCN. Mọi nghĩa vụ thuế và bảo hiểm phát sinh sẽ do người sử dụng lao động đại diện kê khai và chi trả cho cơ quan nhà nước.
            </p>
          </div>
        </div>

        {/* 3. BẢNG TỶ LỆ ĐÓNG BẢO HIỂM NĂM 2024 - 2026 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#0ea5e9]" /> Tỷ lệ đóng bảo hiểm bắt buộc mới nhất năm 2024 - 2026
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <th className="p-3">Loại Bảo Hiểm</th>
                  <th className="p-3 text-center">Người Lao Động Đóng</th>
                  <th className="p-3 text-center">Doanh Nghiệp Đóng</th>
                  <th className="p-3 text-right">Tổng Mức Đóng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-600 dark:text-slate-300 font-medium">
                <tr>
                  <td className="p-3 font-semibold">Bảo hiểm xã hội (BHXH)</td>
                  <td className="p-3 text-center font-mono text-[#0ea5e9] font-bold">8.0%</td>
                  <td className="p-3 text-center font-mono font-semibold">17.5%</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-white">25.5%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Bảo hiểm y tế (BHYT)</td>
                  <td className="p-3 text-center font-mono text-[#0ea5e9] font-bold">1.5%</td>
                  <td className="p-3 text-center font-mono font-semibold">3.0%</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-white">4.5%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Bảo hiểm thất nghiệp (BHTN)</td>
                  <td className="p-3 text-center font-mono text-[#0ea5e9] font-bold">1.0%</td>
                  <td className="p-3 text-center font-mono font-semibold">1.0%</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-white">2.0%</td>
                </tr>
                <tr className="bg-sky-50/50 dark:bg-sky-950/20 font-bold text-slate-900 dark:text-white">
                  <td className="p-3">TỔNG CỘNG TỶ LỆ</td>
                  <td className="p-3 text-center font-mono text-[#0ea5e9] text-sm">10.5%</td>
                  <td className="p-3 text-center font-mono text-sm">21.5%</td>
                  <td className="p-3 text-right font-mono text-sm text-[#0ea5e9]">32.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#0ea5e9]" /> Câu Hỏi Thường Gặp (FAQ)
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-[#0ea5e9] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp size={16} className="text-[#0ea5e9] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
