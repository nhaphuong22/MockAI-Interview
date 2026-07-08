import { useSearchParams } from "react-router-dom";
import GrossNetCalculator from "./tools/GrossNetCalculator";
import AIQuestionGenerator from "./tools/AIQuestionGenerator";

export function Tools() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "questions" ? "questions" : "salary";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-wider bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
            Công Cụ Tính Lương & Bộ Câu Hỏi Phỏng Vấn
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Khám phá các công cụ thông minh hỗ trợ bạn tính toán lương Net thực nhận chính xác và tự động chuẩn bị các câu hỏi phỏng vấn theo sát năng lực thực tế.
          </p>
        </div>

        {/* CONTENT */}
        <div className="bg-slate-50/30 dark:bg-[#0b0f19]/10 rounded-3xl border border-slate-100 dark:border-white/5 p-2 lg:p-6 transition-all">
          {activeTab === "salary" ? (
            <GrossNetCalculator />
          ) : (
            <AIQuestionGenerator />
          )}
        </div>

      </div>
    </div>
  );
}
export default Tools;
