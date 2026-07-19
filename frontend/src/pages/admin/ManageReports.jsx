import { useState, useEffect } from "react";
import { 
  Search, 
  Flag, 
  Check, 
  X,
  Clock,
  User,
  AlertTriangle,
  Building,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { reportApi } from "../../api/reportApi";
import { useUiStore } from "../../store/useUiStore";
import confetti from "canvas-confetti";

export function ManageReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | RESOLVED | REJECTED
  const [refetchKey, setRefetchKey] = useState(0);
  const showToast = useUiStore((state) => state.showToast);

  const triggerRefetch = () => setRefetchKey(prev => prev + 1);

  // Fetch reports from backend
  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await reportApi.getAdminReports();
        if (active) {
          setReports(res.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách báo cáo:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchReports();
    return () => {
      active = false;
    };
  }, [refetchKey]);

  // Handle status update
  const handleUpdateStatus = async (id, status) => {
    try {
      await reportApi.updateReportStatus(id, status);
      setReports(prev => prev.map(report => {
        if (report.id === id) {
          return { ...report, status };
        }
        return report;
      }));

      if (status === 'RESOLVED') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#38bdf8']
        });
        showToast({ message: "Đã xử lý báo cáo thành công", type: "success" });
      } else {
        showToast({ message: "Đã từ chối báo cáo", type: "info" });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái báo cáo:", error);
      showToast({ message: "Cập nhật báo cáo thất bại", type: "error" });
    }
  };

  // Counts
  const pendingCount = reports.filter(r => r.status === "PENDING").length;
  const resolvedCount = reports.filter(r => r.status === "RESOLVED").length;
  const rejectedCount = reports.filter(r => r.status === "REJECTED").length;

  // Filtered
  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.target_title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.reporter_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = r.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Báo Cáo Vi Phạm</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm tra và xử lý các báo cáo từ cộng đồng về bài viết hoặc tin đăng vi phạm.</p>
        </div>

        {/* Tab & Search Toolbar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "PENDING" 
                  ? "bg-white text-amber-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock className="w-4 h-4" />
              Chờ Xử Lý
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-slate-200 text-slate-600"
              }`}>
                {pendingCount}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab("RESOLVED")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "RESOLVED" 
                  ? "bg-white text-[#0ea5e9] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Check className="w-4 h-4" />
              Đã Xử Lý
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "RESOLVED" ? "bg-sky-50 text-[#0ea5e9]" : "bg-slate-200 text-slate-600"
              }`}>
                {resolvedCount}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("REJECTED")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "REJECTED" 
                  ? "bg-white text-slate-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <X className="w-4 h-4" />
              Từ Chối
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "REJECTED" ? "bg-slate-100 text-slate-700" : "bg-slate-200 text-slate-600"
              }`}>
                {rejectedCount}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* Report Cards Directory */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-bold">Đang tải danh sách báo cáo...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <motion.div 
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100/85 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          report.target_type === 'JOB' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-teal-50 text-teal-600 border border-teal-100'
                        }`}>
                          {report.target_type === 'JOB' ? <Building className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {report.target_type === 'JOB' ? 'Việc làm' : 'Bài viết'}
                        </span>
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {report.reason}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(report.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 leading-snug mb-1">Nội dung bị báo cáo: {report.target_title}</h3>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                      <p className="text-xs text-slate-600 font-medium whitespace-pre-line">
                        <span className="font-bold text-slate-700">Chi tiết vi phạm: </span> 
                        {report.description || "Không có mô tả thêm."}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span>Người báo cáo: <span className="text-[#0ea5e9]">{report.reporter_name}</span> ({report.reporter_email})</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  {report.status === 'PENDING' && (
                    <div className="flex flex-row md:flex-col items-center gap-2 pt-2 md:pt-0 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                      <button 
                        onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                        className="w-full px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all outline-none"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Xác Nhận Có Lỗi
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                        className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                        Bỏ Qua
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold text-xs bg-white rounded-3xl border border-slate-100">
                Không tìm thấy báo cáo nào trong mục này.
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default ManageReports;
