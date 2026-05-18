import { useState } from "react";
import { 
  Search, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Check, 
  X,
  Star,
  Eye,
  AlertCircle,
  FileCheck,
  Globe,
  XOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { mockJobPosts as initialJobs } from "./mockAdminData";
import confetti from "canvas-confetti";

export function ManageJobPosts() {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "approved" | "rejected"
  
  // Inspector state
  const [inspectJob, setInspectJob] = useState(null);
  const [rejectReasonJob, setRejectReasonJob] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState("");

  // Toggle Featured status
  const handleToggleFeatured = (id) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, featured: !job.featured };
      }
      return job;
    }));
    
    if (inspectJob && inspectJob.id === id) {
      setInspectJob(prev => ({ ...prev, featured: !prev.featured }));
    }
  };

  // Change Job status
  const handleChangeStatus = (id, newStatus) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, status: newStatus };
      }
      return job;
    }));

    if (newStatus === "Approved") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#10b981', '#38bdf8']
      });
    }

    if (inspectJob && inspectJob.id === id) {
      setInspectJob(prev => ({ ...prev, status: newStatus }));
    }
    
    setRejectReasonJob(null);
    setRejectReasonText("");
  };

  // Counts
  const pendingCount = jobs.filter(j => j.status === "Pending").length;
  const approvedCount = jobs.filter(j => j.status === "Approved").length;
  const rejectedCount = jobs.filter(j => j.status === "Rejected").length;

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "pending" ? job.status === "Pending" :
                       activeTab === "approved" ? job.status === "Approved" : job.status === "Rejected";
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Tin Tuyển Dụng</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm duyệt tin đăng tuyển mới từ doanh nghiệp, ghim nổi bật hoặc tạm gỡ bài tuyển dụng.</p>
        </div>

        {/* Toolbar & Tab-based Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logical Tabs for Jobs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "pending" 
                  ? "bg-white text-[#0ea5e9] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Chờ Kiểm Duyệt
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "pending" ? "bg-sky-50 text-[#0ea5e9]" : "bg-slate-200 text-slate-600"
              }`}>
                {pendingCount}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "approved" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Globe className="w-4 h-4" />
              Đã Phê Duyệt
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>
                {approvedCount}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("rejected")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "rejected" 
                  ? "bg-white text-rose-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <XOctagon className="w-4 h-4" />
              Đã Từ Chối
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "rejected" ? "bg-rose-50 text-rose-700" : "bg-slate-200 text-slate-600"
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
              placeholder="Tìm tin tuyển dụng hoặc công ty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* Job Posts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Công Việc</th>
                  <th className="px-6 py-4">Doanh Nghiệp</th>
                  <th className="px-6 py-4">Lương / Địa Điểm</th>
                  <th className="px-6 py-4">Ngày Đăng</th>
                  {activeTab === "approved" && <th className="px-6 py-4">Nổi Bật</th>}
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Job Title */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            {job.title}
                            {job.type === "Remote" && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold uppercase">Remote</span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">{job.id}</p>
                        </div>
                      </td>
                      {/* Company */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{job.company}</span>
                      </td>
                      {/* Salary & Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-500 font-medium space-y-0.5">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </td>
                      {/* Posted Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        {job.postedDate}
                      </td>
                      {/* Featured (Star icon) - Only in Approved tab */}
                      {activeTab === "approved" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleToggleFeatured(job.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              job.featured ? "text-amber-500 hover:text-amber-600 bg-amber-50" : "text-slate-300 hover:text-slate-400"
                            }`}
                            title={job.featured ? "Gỡ nổi bật" : "Ghim nổi bật"}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                      )}
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                          job.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {job.status === "Approved" ? "Đang chạy" : job.status === "Pending" ? "Đang duyệt" : "Đã từ chối"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setInspectJob(job)}
                            className="text-slate-400 hover:text-[#0ea5e9] font-semibold text-xs px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                          >
                            Chi Tiết
                          </button>
                          
                          {activeTab === "pending" && (
                            <>
                              <button 
                                onClick={() => setRejectReasonJob(job)}
                                className="text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Từ chối tin"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleChangeStatus(job.id, "Approved")}
                                className="text-emerald-500 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                                title="Duyệt tin"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {activeTab === "approved" && (
                            <button 
                              onClick={() => setRejectReasonJob(job)}
                              className="text-rose-500 font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
                              title="Gỡ tin"
                            >
                              <X className="w-3.5 h-3.5" />
                              Gỡ Tin
                            </button>
                          )}

                          {activeTab === "rejected" && (
                            <button 
                              onClick={() => handleChangeStatus(job.id, "Approved")}
                              className="text-emerald-600 font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                              title="Duyệt lại"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Duyệt Lại
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "approved" ? "7" : "6"} className="text-center py-16 text-slate-400 font-semibold text-xs">
                      {activeTab === "pending" ? "Tuyệt vời! Không còn tin tuyển dụng nào chờ duyệt." : 
                       activeTab === "approved" ? "Không tìm thấy tin tuyển dụng đang hoạt động nào." : "Không có tin nào bị từ chối."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job Content Inspector Modal */}
        <AnimatePresence>
          {inspectJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setInspectJob(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden relative z-10 p-6 flex flex-col gap-6"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setInspectJob(null)}
                  className="absolute right-5 top-5 p-1 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      inspectJob.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                      inspectJob.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {inspectJob.status === "Approved" ? "Đã Phê Duyệt" : inspectJob.status === "Pending" ? "Chờ Kiểm Duyệt" : "Đã Từ Chối"}
                    </span>
                    
                    {inspectJob.featured && (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        Ghim Nổi Bật
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{inspectJob.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{inspectJob.company}</p>
                </div>

                {/* Job Specs */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400">Mức Lương</p>
                      <p className="text-slate-800 mt-0.5">{inspectJob.salary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400">Địa Điểm / Hình thức</p>
                      <p className="text-slate-800 mt-0.5">{inspectJob.location} • {inspectJob.type}</p>
                    </div>
                  </div>
                </div>

                {/* Mock Job Description Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Mô tả công việc & Yêu cầu</h4>
                  <div className="text-xs text-slate-500 leading-relaxed space-y-2 max-h-40 overflow-y-auto pr-1">
                    <p>• Thiết kế và phát triển các thành phần UI chất lượng cao bằng React và TypeScript.</p>
                    <p>• Phối hợp chặt chẽ với đội ngũ UX/UI thiết kế sản phẩm sang trọng và có chiều sâu.</p>
                    <p>• Tối ưu hóa hiệu năng ứng dụng, tốc độ tải trang cực nhanh và responsive xuất sắc.</p>
                    <p>• Yêu cầu tối thiểu 2 năm kinh nghiệm làm việc thực tế với ReactJS, NextJS hoặc Vite.</p>
                    <p>• Có tư duy thuật toán tốt, khả năng tự học hỏi nghiên cứu mô hình AI là lợi thế lớn.</p>
                  </div>
                </div>

                {/* Actions inside Modal */}
                <div className="flex gap-2 justify-end border-t border-slate-100 pt-5 mt-2">
                  {inspectJob.status === "Approved" && (
                    <button 
                      onClick={() => handleToggleFeatured(inspectJob.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
                        inspectJob.featured 
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100" 
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {inspectJob.featured ? "Gỡ Nổi Bật" : "Ghim Nổi Bật"}
                    </button>
                  )}

                  {inspectJob.status === "Pending" && (
                    <>
                      <button 
                        onClick={() => setRejectReasonJob(inspectJob)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                      >
                        Từ Chối
                      </button>
                      <button 
                        onClick={() => handleChangeStatus(inspectJob.id, "Approved")}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                      >
                        Phê Duyệt
                      </button>
                    </>
                  )}

                  {inspectJob.status === "Approved" && (
                    <button 
                      onClick={() => setRejectReasonJob(inspectJob)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                    >
                      Gỡ Tin Tuyển Dụng
                    </button>
                  )}

                  {inspectJob.status === "Rejected" && (
                    <button 
                      onClick={() => handleChangeStatus(inspectJob.id, "Approved")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                    >
                      Duyệt Lại Tin Đăng
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Reject Reason Dialog */}
        <AnimatePresence>
          {rejectReasonJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRejectReasonJob(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-xl border border-slate-100"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 text-center">
                  {rejectReasonJob.status === "Approved" ? "Gỡ Tin Tuyển Dụng?" : "Từ Chối Tin Đăng?"}
                </h3>
                <p className="text-xs text-slate-500 mb-4 text-center text-pretty">
                  Nhập lý do {rejectReasonJob.status === "Approved" ? "gỡ tin" : "từ chối"} tuyển dụng <strong>{rejectReasonJob.title}</strong> để gửi thông báo cho nhà tuyển dụng.
                </p>
                
                <textarea 
                  rows="3"
                  placeholder="Lý do: JD thiếu thông tin, sai phân loại ngành nghề..."
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] mb-4 text-slate-700"
                />

                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setRejectReasonJob(null)}
                    className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    onClick={() => handleChangeStatus(rejectReasonJob.id, "Rejected")}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-rose-200"
                  >
                    Xác Nhận
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
