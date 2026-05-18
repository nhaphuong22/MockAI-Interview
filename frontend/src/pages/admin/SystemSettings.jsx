import { useState } from "react";
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  HelpCircle, 
  Save, 
  Sparkles,
  Info,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { mockSystemSettings } from "./mockAdminData";

export function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(mockSystemSettings.maintenanceMode);
  const [siteName, setSiteName] = useState(mockSystemSettings.siteName);
  
  // Save & Success states
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1000);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-xl mx-auto mt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cài Đặt Hệ Thống</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình trạng thái vận hành của trang web MockAI.</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <Settings className="w-4.5 h-4.5 text-[#0ea5e9]" />
            Trạng Thái Vận Hành
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Site Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Nền Tảng</label>
              <input 
                type="text" 
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700"
              />
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="max-w-[70%]">
                <h4 className="text-xs font-bold text-slate-800">Chế Độ Bảo Trì (Maintenance)</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                  Khi bật, toàn bộ hệ thống sẽ tạm ngưng hoạt động đối với Ứng viên & Nhà tuyển dụng để bảo trì kỹ thuật.
                </p>
              </div>
              
              <button 
                type="button"
                onClick={() => setMaintenanceMode(prev => !prev)}
                className="text-[#0ea5e9] focus:outline-none active:scale-95 transition-transform"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-12 h-12 text-[#0ea5e9] fill-current" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-300" />
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-50 gap-2">
              <button 
                type="submit"
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 min-w-[120px] justify-center outline-none"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Đã Lưu!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu Cài Đặt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* System Info */}
        <div className="bg-slate-100/60 rounded-2xl p-5 border border-slate-200/50 mt-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            <h4 className="text-slate-700 font-bold">Thông Tin Phiên Bản</h4>
            <p className="mt-1">MockAI Enterprise Engine v{mockSystemSettings.version}</p>
            <p>Trạng thái cơ sở dữ liệu: Hoạt động (31 bảng dữ liệu trực tuyến)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
