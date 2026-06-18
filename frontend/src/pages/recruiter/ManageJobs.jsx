import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Briefcase, Plus, Trash2, Calendar, ToggleLeft, ToggleRight, Loader2, Eye, Pencil, CheckCircle2, Layers } from "lucide-react";

import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";

export function ManageJobs() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentHrId = user?.id;

  const [filterStatus, setFilterStatus] = useState(""); 

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["manage-jobs", currentHrId, filterStatus],
    queryFn: async () => {
      const response = await jobApi.getJobs({
        hr_id: currentHrId,
        status: filterStatus || undefined,
        limit: 100 
      });
      return response; 
    },
    enabled: !!currentHrId
  });

  const jobsList = data?.data?.items || [];

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) => {
      const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
      const jobPost = jobsList.find(j => j.id === id);
      return jobApi.updateJob(id, {
        title: jobPost.title,
        description: jobPost.description,
        status: newStatus,
        deadline: jobPost.deadline,
        positions: jobPost.positions || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-jobs"]);
      showToast("Cập nhật trạng thái tin đăng thành công!", "success");
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      showToast("Không thể cập nhật trạng thái tin đăng.", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-jobs"]);
      showToast("Xóa chiến dịch thành công!", "success");
    },
    onError: (error) => {
      console.error("Lỗi khi xóa chiến dịch:", error);
      showToast("Xóa chiến dịch thất bại!", "error");
    }
  });

  const handleDeleteJob = (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hoàn toàn chiến dịch "${title}" không? Hành động này không thể hoàn tác.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
      
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-500 transform ${
            toast.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          } ${
            toast.type === "success" 
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" 
              : "bg-rose-50/90 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
              <span className="text-rose-500 font-bold text-sm">!</span>
            </div>
          )}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Chiến Dịch Tuyển Dụng</h1>
            <p className="text-gray-500 text-sm">Xem danh sách, cập nhật trạng thái và quản lý chiến dịch</p>
          </div>
          
          <Link
            to="/hr/dashboard/post-job"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-sky-100 transition-all hover:brightness-105"
          >
            <Plus className="w-5 h-5" /> Đăng chiến dịch mới
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Tất cả ({jobsList.length + (isLoading ? 0 : 0)})
          </button>
          <button
            onClick={() => setFilterStatus("OPEN")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "OPEN" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Đang mở
          </button>
          <button
            onClick={() => setFilterStatus("CLOSED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "CLOSED" ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-100" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Đã đóng
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Đang tải danh sách chiến dịch...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-red-500 font-semibold mb-2">Đã xảy ra lỗi khi tải danh sách!</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">
              Tải lại
            </button>
          </div>
        ) : jobsList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có chiến dịch nào</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Bạn chưa đăng chiến dịch tuyển dụng nào phù hợp với bộ lọc hiện tại.</p>
            <Link
              to="/hr/dashboard/post-job"
              className="px-5 py-2.5 bg-[#0ea5e9] text-white font-bold rounded-xl text-sm hover:brightness-105 transition-all shadow-md shadow-sky-100"
            >
              Tạo chiến dịch ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Chiến Dịch</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Số Lượng Vị Trí</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Hạn Nộp</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobsList.map((jobPost) => (
                    <tr key={jobPost.id} className="hover:bg-sky-50/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0ea5e9]/10 rounded-xl flex items-center justify-center text-[#0ea5e9] font-bold">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors">
                              {jobPost.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Đăng ngày: {new Date(jobPost.created_at).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                          <Layers className="w-4 h-4 text-sky-500" />
                          {jobPost.positions?.length || 0} vị trí
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {jobPost.deadline ? new Date(jobPost.deadline).toLocaleDateString("vi-VN") : "Không thời hạn"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: jobPost.id, currentStatus: jobPost.status })}
                          disabled={toggleStatusMutation.isPending}
                          className="flex items-center gap-1 text-gray-500 hover:text-[#0ea5e9] disabled:opacity-50 transition-all cursor-pointer"
                          title="Click để thay đổi trạng thái"
                        >
                          {jobPost.status === "OPEN" ? (
                            <>
                              <ToggleRight className="w-7 h-7 text-[#0ea5e9]" />
                              <span className="text-xs font-bold text-green-600">Đang mở</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-7 h-7 text-gray-300" />
                              <span className="text-xs font-bold text-gray-400">Đã đóng</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Wait, the EditJob does not exist. We should probably create EditJob or just link to PostJob with an ID param? 
                              Currently there's no EditJob so I will just leave the pencil link. */}
                          <Link
                            to={`/hr/dashboard/edit-job/${jobPost.id}`}
                            className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-all inline-block"
                            title="Chỉnh sửa chiến dịch"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/jobs/${jobPost.id}`}
                            className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-all inline-block"
                            title="Xem chi tiết chiến dịch"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(jobPost.id, jobPost.title)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa chiến dịch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ManageJobs;
