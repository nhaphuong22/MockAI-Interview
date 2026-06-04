import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Building, 
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  Users,
  Briefcase,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import axiosClient from "../../api/axiosClient";
import { useUiStore } from "../../store/useUiStore";

export function ManageCompanies() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/pending');
      // map backend data to frontend format
      return res.data.map(u => ({
        id: u.id,
        name: u.company_name,
        industry: "N/A",
        status: "Pending", // backend only returns PENDING
        logo: "🏢",
        jobCount: 0,
        applicationsCount: 0,
        documentUrl: u.company_document_url,
        email: u.email
      }));
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await axiosClient.post(`/verification/${id}/review`, { status });
    },
    onSuccess: () => {
      showToast({ message: 'Đã cập nhật trạng thái hồ sơ', type: 'success' });
      queryClient.invalidateQueries(['pendingVerifications']);
      setSelectedCompany(null);
    },
    onError: () => showToast({ message: 'Có lỗi xảy ra!', type: 'error' })
  });

  // Change Company Status
  const handleChangeStatus = (id, newStatus) => {
    // newStatus: 'Active' -> 'APPROVED', 'Suspended' -> 'REJECTED'
    const backendStatus = newStatus === 'Active' ? 'APPROVED' : 'REJECTED';
    reviewMutation.mutate({ id, status: backendStatus });
  };

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Doanh Nghiệp</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ đối tác doanh nghiệp tuyển dụng, kiểm duyệt tin đăng và theo dõi hiệu suất tuyển dụng.</p>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm tên công ty hoặc ngành..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          {/* Filters */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="All">Tất Cả Trạng Thế</option>
            <option value="Active">Đang Hoạt Động</option>
            <option value="Pending">Chờ Phê Duyệt</option>
            <option value="Suspended">Đang Tạm Khóa</option>
          </select>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(c => (
                <motion.div 
                  key={c.id}
                  layout
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#f0f9ff] text-2xl flex items-center justify-center border border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {c.logo}
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                        c.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {c.status === "Active" ? "Hoạt động" : c.status === "Pending" ? "Chờ duyệt" : "Đang khóa"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{c.name}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{c.email}</p>

                    <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-semibold text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Giấy phép ĐKKD:</span>
                        <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Xem file
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 border-t border-slate-50 pt-4">
                    <button 
                      onClick={() => setSelectedCompany(c)}
                      className="w-full text-slate-500 hover:text-[#0ea5e9] bg-slate-50 hover:bg-sky-50 font-bold text-xs py-2 rounded-xl transition-colors"
                    >
                      Duyệt Hồ Sơ
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 font-medium text-xs">
                Không có doanh nghiệp nào chờ duyệt!
              </div>
            )}
          </div>
        )}

        {/* Selected Company Details Modal */}
        <AnimatePresence>
          {selectedCompany && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCompany(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden relative z-10 p-6 flex flex-col gap-6"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="absolute right-5 top-5 p-1 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Company Header */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl border border-slate-100">
                    {selectedCompany.logo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedCompany.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">{selectedCompany.industry}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-2">
                      Quy mô: {selectedCompany.employees} nhân sự
                    </span>
                  </div>
                </div>

                {/* Data Overview */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Tin Đăng Hoạt Động</p>
                    <p className="text-slate-800 text-sm mt-0.5">{selectedCompany.jobCount}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Tổng Lượt Ứng Tuyển</p>
                    <p className="text-slate-800 text-sm mt-0.5">{selectedCompany.applicationsCount}</p>
                  </div>
                </div>

                {/* Actions Suite inside Modal */}
                <div className="flex gap-2 justify-end border-t border-slate-100 pt-5 mt-2">
                  {selectedCompany.status === "Active" ? (
                    <button 
                      onClick={() => handleChangeStatus(selectedCompany.id, "Suspended")}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      Khóa Đối Tác
                    </button>
                  ) : (
                    <>
                      {selectedCompany.status === "Pending" && (
                        <button 
                          onClick={() => handleChangeStatus(selectedCompany.id, "Active")}
                          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          Phê Duyệt Hoạt Động
                        </button>
                      )}
                      {selectedCompany.status === "Suspended" && (
                        <button 
                          onClick={() => handleChangeStatus(selectedCompany.id, "Active")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          Mở Khóa Doanh Nghiệp
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
