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
  Loader2,
  FileCheck,
  Globe,
  XOctagon,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import axiosClient from "../../api/axiosClient";
import { useUiStore } from "../../store/useUiStore";
import { ReviewCompanyModal } from './components/ReviewCompanyModal';

export function ManageCompanies() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['allVerifications'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/all');
      return res.data.map(c => ({
        id: c.company_id,
        name: c.company_name,
        taxCode: c.company_tax_code,
        industry: c.company_industry || "N/A",
        status: c.verification_status === "PENDING" ? "Pending" 
              : c.verification_status === "APPROVED" ? "Active" 
              : "Suspended",
        logo: "🏢",
        employees: c.company_size || "N/A",
        jobCount: 0,
        applicationsCount: 0,
        documentUrl: c.company_document_url,
        authLetterUrl: c.auth_letter_url,
        idFrontUrl: c.id_front_url,
        idBackUrl: c.id_back_url,
        businessType: c.company_business_type,
        idCardNumber: c.hr_id_card_number,
        email: c.hr_email,
        phone: c.hr_phone || "N/A",
        hrName: c.hr_name,
        website: c.company_website,
        address: `${c.company_address ? c.company_address + ', ' : ''}${c.company_city || ''}`,
        createdAt: new Date(c.created_at).toLocaleDateString("vi-VN"),
      }));
    }
  });

  // Handle Approve/Reject API calls
  const { mutate: handleChangeStatus } = useMutation({
    mutationFn: async ({ id, newStatus, reason }) => {
      // Map Active -> APPROVED, Suspended -> SUSPENDED
      const backendStatus = newStatus === "Active" ? "APPROVED" : "SUSPENDED";
      await axiosClient.post(`/verification/${id}/review`, { 
        status: backendStatus, 
        reject_reason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allVerifications']);
      showToast({ message: 'Cập nhật trạng thái công ty thành công!', type: 'success' });
      setSelectedCompany(null);
    },
    onError: () => {
      showToast({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.', type: 'error' });
    }
  });

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = companies.filter(c => c.status === "Pending").length;
  const activeCount = companies.filter(c => c.status === "Active").length;
  const suspendedCount = companies.filter(c => c.status === "Suspended").length;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Doanh Nghiệp</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ đối tác doanh nghiệp tuyển dụng, kiểm duyệt tin đăng và theo dõi hiệu suất tuyển dụng.</p>
        </div>

        {/* Toolbar & Tab-based Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logical Tabs for Companies */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setStatusFilter("Pending")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === "Pending" 
                  ? "bg-white text-[#0ea5e9] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Chờ Kiểm Duyệt
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                statusFilter === "Pending" ? "bg-sky-50 text-[#0ea5e9]" : "bg-slate-200 text-slate-600"
              }`}>
                {pendingCount}
              </span>
            </button>
            
            <button 
              onClick={() => setStatusFilter("Active")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === "Active" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Globe className="w-4 h-4" />
              Đã Phê Duyệt
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                statusFilter === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>
                {activeCount}
              </span>
            </button>

            <button 
              onClick={() => setStatusFilter("Suspended")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === "Suspended" 
                  ? "bg-white text-rose-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <XOctagon className="w-4 h-4" />
              Đã Từ Chối
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                statusFilter === "Suspended" ? "bg-rose-50 text-rose-700" : "bg-slate-200 text-slate-600"
              }`}>
                {suspendedCount}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm tin công ty hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Công Ty</th>
                  <th className="px-6 py-4">Mã Số Thuế</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Ngày Đăng Ký</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9] mx-auto" />
                    </td>
                  </tr>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Company Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#f0f9ff] text-xl flex items-center justify-center border border-slate-50 shadow-sm shrink-0">
                            {c.logo}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {c.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">{c.industry}</p>
                          </div>
                        </div>
                      </td>
                      {/* Tax Code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{c.taxCode}</span>
                      </td>
                      {/* Contact Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-500 font-medium space-y-0.5">
                          <div><span className="text-slate-400">Email:</span> {c.email}</div>
                          <div><span className="text-slate-400">SĐT:</span> {c.phone}</div>
                        </div>
                      </td>
                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        {c.createdAt}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                          c.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {c.status === "Active" ? "Đã duyệt" : c.status === "Pending" ? "Đang duyệt" : "Đã từ chối"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedCompany(c)}
                            className="text-slate-400 hover:text-[#0ea5e9] font-semibold text-xs px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                          >
                            Chi Tiết
                          </button>
                          
                          {statusFilter === "Pending" && (
                            <>
                              <button 
                                onClick={() => handleChangeStatus({ id: c.id, newStatus: "Suspended" })}
                                className="text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Từ chối"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleChangeStatus({ id: c.id, newStatus: "Active" })}
                                className="text-emerald-500 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                                title="Phê duyệt"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium text-xs">
                      Không tìm thấy công ty nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Company Details Modal */}
        <AnimatePresence>
          {selectedCompany && (
            <ReviewCompanyModal 
              company={selectedCompany} 
              onClose={() => setSelectedCompany(null)}
              onApprove={(id) => handleChangeStatus({ id, newStatus: "Active" })}
              onReject={(id, reason) => handleChangeStatus({ id, newStatus: "Suspended", reason })}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
