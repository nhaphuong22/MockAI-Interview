import { useState, useEffect, useMemo } from 'react';
import { X, User, AlertTriangle, ShieldAlert, EyeOff, Eye, ShieldX, Check } from 'lucide-react';
import { reportApi } from '../../../api/reportApi';
import { useUiStore } from '../../../store/useUiStore';
import confetti from "canvas-confetti";

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

export function ReportDetailModal({ isOpen, onClose, targetType, targetId, onSuccess }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionState, setActionState] = useState({ type: null, step: 0 }); // step: 0=idle, 1=confirm, 2=loading
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    let active = true;
    if (isOpen && targetType && targetId) {
      setActionState({ type: null, step: 0 });
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const res = await reportApi.getReportDetails(targetType, targetId);
          if (active) setDetails(res.data);
        } catch (error) {
          console.error("Lỗi khi tải chi tiết báo cáo:", error);
          showToast({ message: "Lỗi khi tải chi tiết báo cáo", type: "error" });
        } finally {
          if (active) setIsLoading(false);
        }
      };
      fetchDetails();
    }
    return () => { active = false; };
  }, [isOpen, targetType, targetId, showToast]);

  // Aggregated summary of reasons
  const reasonSummary = useMemo(() => {
    if (!details?.reports) return [];
    const counts = {};
    details.reports.forEach(r => {
      counts[r.reason] = (counts[r.reason] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [details]);

  const handleActionClick = async (actionType) => {
    if (actionState.type === actionType && actionState.step === 1) {
      // Execute
      setActionState({ type: actionType, step: 2 });
      try {
        if (actionType === 'WARN') {
          await reportApi.warnUser(targetType, targetId);
          showToast({ message: "Đã gửi cảnh báo tới người đăng", type: "success" });
        } else if (actionType === 'DELETE') {
          await reportApi.deleteContent(targetType, targetId);
          showToast({ message: "Đã ẩn nội dung vi phạm thành công", type: "success" });
          onSuccess?.();
          onClose();
        } else if (actionType === 'UNHIDE') {
          await reportApi.unhideContent(targetType, targetId);
          showToast({ message: "Đã gỡ ẩn nội dung thành công", type: "success" });
          onSuccess?.();
          onClose();
        } else if (actionType === 'REJECT') {
          await reportApi.rejectReports(targetType, targetId);
          showToast({ message: "Đã đánh dấu an toàn và từ chối các báo cáo", type: "info" });
          onSuccess?.();
          onClose();
        }
      } catch (error) {
        const errMsg = error?.response?.data?.error || "Thực hiện hành động thất bại";
        console.error(`Lỗi khi thực hiện hành động ${actionType}:`, error);
        showToast({ message: errMsg, type: "error" });
      } finally {
        setActionState({ type: null, step: 0 });
      }
    } else {
      // Ask for confirmation
      setActionState({ type: actionType, step: 1 });
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setActionState(prev => prev.step === 1 && prev.type === actionType ? { type: null, step: 0 } : prev);
      }, 3000);
    }
  };

  // Derive hidden status from target_data
  const isHidden = details?.target_data?.status === 'REJECTED';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200/60 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#0ea5e9]" />
              Chi Tiết Báo Cáo
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Kiểm tra thông tin vi phạm và đưa ra quyết định xử lý</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-50/50">
          {isLoading ? (
             <div className="flex justify-center items-center w-full h-64">
               <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : details ? (
            <>
              {/* Left Column: Target Info & Summary */}
              <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-slate-200/60 overflow-y-auto">
                
                {/* Content Preview */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {targetType === 'JOB' ? 'Việc làm' : 'Bài viết Cộng đồng'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-snug mb-3">
                    {details.target_data?.title || 'Không rõ tiêu đề'}
                  </h3>
                  
                  {targetType === 'JOB' && (
                    <div className="text-sm text-slate-600 space-y-2 bg-slate-50 p-3 rounded-xl">
                      <p className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="font-medium">Mức lương:</span> 
                        <span className="font-bold text-slate-800">{details.target_data?.salary || 'Không yêu cầu'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium">Trạng thái:</span> 
                        <span className="font-bold text-emerald-600">{details.target_data?.status}</span>
                      </p>
                    </div>
                  )}

                  {targetType === 'COMMUNITY_POST' && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="line-clamp-6 italic leading-relaxed text-slate-700">
                        "{details.target_data?.content}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Aggregated Reasons */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    Tổng hợp lý do vi phạm ({details.reports?.length} lượt)
                  </h4>
                  <div className="space-y-3">
                    {reasonSummary.map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                          {reason}
                        </span>
                        <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">
                          {count} lượt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Reports List */}
              <div className="w-full lg:w-7/12 p-6 flex flex-col h-[50vh] lg:h-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Chi tiết phản hồi từ cộng đồng
                  <span className="text-xs font-medium text-slate-400 normal-case bg-white px-2 py-1 rounded-lg border border-slate-100">
                    Sắp xếp: Mới nhất
                  </span>
                </h3>
                
                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-6">
                  {details.reports?.map((report, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0ea5e9]/20 transition-all group">
                       <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">{report.reporter_name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {formatTimeAgo(report.created_at)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md">
                            {report.reason}
                          </span>
                       </div>
                       {report.description ? (
                         <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                           <span className="font-semibold text-slate-700">Ghi chú: </span>
                           {report.description}
                         </div>
                       ) : (
                         <div className="text-xs text-slate-400 italic px-1">Người dùng không để lại chi tiết mô tả.</div>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
             <div className="text-center text-slate-500 py-10 text-sm w-full">Không thể tải dữ liệu.</div>
          )}
        </div>

        {/* Sticky Action Footer */}
        {details && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">

            {/* Hidden badge */}
            {isHidden && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl mr-auto">
                <EyeOff className="w-3.5 h-3.5" /> Nội dung đang bị ẩn
              </span>
            )}

            <button 
              disabled={actionState.step === 2}
              onClick={() => handleActionClick('REJECT')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all outline-none ${
                actionState.type === 'REJECT' && actionState.step === 1
                  ? "bg-slate-800 text-white shadow-md ring-2 ring-slate-800/30"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {actionState.type === 'REJECT' && actionState.step === 2 ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : actionState.type === 'REJECT' && actionState.step === 1 ? (
                <>Nhấn lần nữa để Xác nhận</>
              ) : (
                <><ShieldX className="w-4 h-4" /> Bỏ Qua (Không lỗi)</>
              )}
            </button>

            <button 
              disabled={actionState.step === 2}
              onClick={() => handleActionClick('WARN')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all outline-none ${
                actionState.type === 'WARN' && actionState.step === 1
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-500/30"
                  : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              {actionState.type === 'WARN' && actionState.step === 2 ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              ) : actionState.type === 'WARN' && actionState.step === 1 ? (
                <>Xác nhận Cảnh báo?</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> Cảnh Báo Tác Giả</>
              )}
            </button>
            
            {/* If already hidden: show Unhide button instead of Hide */}
            {isHidden ? (
              <button 
                disabled={actionState.step === 2}
                onClick={() => handleActionClick('UNHIDE')} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all outline-none ${
                  actionState.type === 'UNHIDE' && actionState.step === 1
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {actionState.type === 'UNHIDE' && actionState.step === 2 ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : actionState.type === 'UNHIDE' && actionState.step === 1 ? (
                  <>Bạn chắc chắn gỡ ẩn?</>
                ) : (
                  <><Eye className="w-4 h-4" /> Gỡ Ẩn Nội Dung</>
                )}
              </button>
            ) : (
              <button 
                disabled={actionState.step === 2}
                onClick={() => handleActionClick('DELETE')} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all outline-none ${
                  actionState.type === 'DELETE' && actionState.step === 1
                    ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30"
                    : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                }`}
              >
                {actionState.type === 'DELETE' && actionState.step === 2 ? (
                  <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                ) : actionState.type === 'DELETE' && actionState.step === 1 ? (
                  <>Bạn có chắc chắn ẩn bài viết này?</>
                ) : (
                  <><EyeOff className="w-4 h-4" /> Ẩn Nội Dung</>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
