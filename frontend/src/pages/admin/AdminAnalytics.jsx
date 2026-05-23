import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Info,
  Server,
  Activity,
  Database,
  Cpu
} from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminAnalytics() {
  const systemHealth = [
    { label: "Trạng thái API", value: "Hoạt động", icon: Server, color: "text-emerald-500 bg-emerald-50" },
    { label: "Độ trễ Database", value: "12 ms", icon: Database, color: "text-sky-500 bg-sky-50" },
    { label: "Tải CPU Máy chủ", value: "8.4 %", icon: Cpu, color: "text-amber-500 bg-amber-50" },
    { label: "Kết nối Realtime", value: "142 Active", icon: Activity, color: "text-[#0ea5e9] bg-sky-50" }
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto flex flex-col justify-center">
        {/* Information Box */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-sky-50 text-[#0ea5e9] rounded-full flex items-center justify-center mx-auto">
            <Info className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-800">Thông Tin Phân Tích Chuyên Sâu</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Các tính năng phân tích chi tiết kỹ năng CV, chấm điểm tuyển dụng và biểu đồ radar năng lực ứng viên phỏng vấn AI được **tích hợp và hiển thị trực tiếp tại Cổng Nhà Tuyển Dụng (HR Dashboard) và Ứng Viên** để đảm bảo tính bảo mật và riêng tư dữ liệu.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Link 
              to="/admin/dashboard" 
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay Lại Dashboard Admin
            </Link>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="mt-12 max-w-xl mx-auto w-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-6">Chỉ số sức khỏe hệ thống (General Stats)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {systemHealth.map((health, index) => {
              const Icon = health.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${health.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">{health.label}</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">{health.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
