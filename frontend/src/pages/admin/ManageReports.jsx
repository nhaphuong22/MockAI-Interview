import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Flag, 
  Eye,
  Building,
  FileText,
  ShieldAlert,
  AlertOctagon,
  Trash2,
  ShieldX,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { reportApi } from "../../api/reportApi";
import { ReportDetailModal } from "./components/ReportDetailModal";

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export function ManageReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refetchKey, setRefetchKey] = useState(0);
  const [activeTab, setActiveTab] = useState("PENDING");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState({ type: null, id: null });

  const triggerRefetch = () => setRefetchKey(prev => prev + 1);

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await reportApi.getGroupedReports();
        if (active) {
          setReports(res.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách báo cáo:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchReports();
    return () => { active = false; };
  }, [refetchKey]);

  const handleViewDetails = (type, id) => {
    setSelectedTarget({ type, id });
    setIsModalOpen(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = (r.target_title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = r.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [reports, searchTerm, activeTab]);

  const counts = useMemo(() => {
    return {
      PENDING: reports.filter(r => r.status === 'PENDING').length,
      RESOLVED: reports.filter(r => r.status === 'RESOLVED').length,
      REJECTED: reports.filter(r => r.status === 'REJECTED').length,
    };
  }, [reports]);

  const getSeverityBadge = (count) => {
    if (count >= 5) return { color: "text-rose-600 bg-rose-50", icon: <AlertOctagon className="w-3.5 h-3.5" />, label: "Nghiêm trọng" };
    if (count >= 3) return { color: "text-amber-600 bg-amber-50", icon: <ShieldAlert className="w-3.5 h-3.5" />, label: "Cảnh báo" };
    return { color: "text-slate-600 bg-slate-50", icon: <Flag className="w-3.5 h-3.5" />, label: "Theo dõi" };
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Quản Lý Báo Cáo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm duyệt nội dung vi phạm, ẩn bài viết hoặc cảnh cáo người dùng.
          </p>
        </div>

        {/* Toolbar & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-2 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'PENDING' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Clock className="w-4 h-4" />
              Chờ Xử Lý
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'PENDING' ? 'bg-indigo-100' : 'bg-slate-100 text-slate-500'}`}>{counts.PENDING}</span>
            </button>
            <button 
              onClick={() => setActiveTab('RESOLVED')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Đã Xử Lý (Ẩn)
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'RESOLVED' ? 'bg-emerald-100' : 'bg-slate-100 text-slate-500'}`}>{counts.RESOLVED}</span>
            </button>
            <button 
              onClick={() => setActiveTab('REJECTED')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'REJECTED' ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <XCircle className="w-4 h-4" />
              Đã Bỏ Qua
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'REJECTED' ? 'bg-slate-200' : 'bg-slate-100 text-slate-500'}`}>{counts.REJECTED}</span>
            </button>
          </div>

          <div className="relative w-full md:w-72 px-2 pb-2 md:pb-0 md:pr-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 md:-translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm nội dung bị báo cáo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Nội Dung</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Người Đăng</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức Độ</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày Báo Cáo</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng Thái</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => {
                      const severity = getSeverityBadge(parseInt(report.report_count, 10));
                      return (
                        <motion.tr 
                          key={`${report.target_type}-${report.target_id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${report.target_type === 'JOB' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                                {report.target_type === 'JOB' ? <Building className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{report.target_title}</h4>
                                <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                  {report.target_type === 'JOB' ? 'Việc làm' : 'Bài viết'} • ID: {report.target_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-semibold text-slate-700">{report.author_name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${severity.color}`}>
                              {severity.icon}
                              {severity.label} ({report.report_count})
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-slate-600">{formatTimeAgo(report.latest_report_time)}</span>
                          </td>
                          <td className="py-4 px-6">
                            {report.status === 'PENDING' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">Đang chờ xử lý</span>}
                            {report.status === 'RESOLVED' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Đã ẩn</span>}
                            {report.status === 'REJECTED' && <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">Đã bỏ qua</span>}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleViewDetails(report.target_type, report.target_id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Chi Tiết <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-slate-400 font-medium text-sm">
                        Không có dữ liệu báo cáo nào trong mục này.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <ReportDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType={selectedTarget.type}
        targetId={selectedTarget.id}
        onSuccess={triggerRefetch}
      />
    </div>
  );
}

export default ManageReports;
