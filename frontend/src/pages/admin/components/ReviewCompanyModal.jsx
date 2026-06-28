import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, CheckCircle2, AlertTriangle, Loader2, Scan, CheckSquare, Square, Building, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';

export function ReviewCompanyModal({ company, onClose, onApprove, onReject }) {
  const [ekycResult, setEkycResult] = useState(null);
  const [checkedPoints, setCheckedPoints] = useState({});
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post(`/verification/${company.id}/scan-id`);
      return res.data;
    },
    onSuccess: (data) => {
      setEkycResult(data.data[0]); // fpt.ai idr vnm returns an array of results
    }
  });

  const handleScan = () => {
    scanMutation.mutate();
  };

  const isSME = company.businessType === 'SME';

  const touchpoints = isSME ? [
    { id: 'tp1', label: 'Tên công ty và MST trùng khớp với GPKD' },
    { id: 'tp2', label: 'GPKD hợp lệ, hình ảnh rõ nét, không tẩy xóa' },
    { id: 'tp3', label: 'Thông tin người đại diện trên GPKD khớp với CCCD' },
    { id: 'tp4', label: 'CCCD hợp lệ, không có dấu hiệu chỉnh sửa' },
  ] : [
    { id: 'tp1', label: 'Tên công ty và MST hợp lệ (Tra cứu trên hệ thống)' },
    { id: 'tp2', label: 'Giấy Ủy Quyền hợp lệ, có mộc đỏ của công ty' },
    { id: 'tp3', label: 'Thông tin người được uỷ quyền khớp với CCCD' },
    { id: 'tp4', label: 'CCCD hợp lệ, không có dấu hiệu chỉnh sửa' },
  ];

  const togglePoint = (id) => {
    setCheckedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = touchpoints.every(tp => checkedPoints[tp.id]);

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    onReject(company.id, rejectReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-6xl h-[90vh] overflow-hidden relative z-10 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-2xl flex items-center justify-center border border-slate-200">
              {company.logo || "🏢"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-800">{company.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isSME ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {isSME ? 'Nhóm 1 (SME)' : 'Nhóm 2 (Enterprise)'}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Mã số thuế: {company.taxCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column: Info & eKYC & Touchpoints */}
          <div className="w-full lg:w-[35%] p-6 overflow-y-auto border-r border-slate-100 bg-white flex flex-col gap-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Thông tin đăng ký</h4>
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-400 mb-1">Tên công ty</span>
                  <span className="text-sm font-bold text-slate-700">{company.name}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 mb-1">Mã số thuế</span>
                    <span className="text-sm font-bold text-slate-700">{company.taxCode}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 mb-1">Người đăng ký (HR)</span>
                    <span className="text-sm font-bold text-slate-700">{company.hrName}</span>
                    <span className="text-xs text-slate-500">{company.email}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 mb-1">Số CCCD đăng ký</span>
                    <span className="text-sm font-bold text-slate-700">{company.idCardNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkpoints Box */}
            <div className="border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 rounded-2xl p-5">
              <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#0ea5e9]" />
                Điểm chạm xét duyệt (Touchpoints)
              </h4>
              <p className="text-xs text-slate-500 mb-4">Admin cần đối chiếu tài liệu và đánh dấu đủ các mục dưới đây mới có thể phê duyệt.</p>
              
              <div className="space-y-2.5">
                {touchpoints.map((tp) => (
                  <label key={tp.id} className="flex items-start gap-3 cursor-pointer group">
                    <button 
                      type="button"
                      onClick={() => togglePoint(tp.id)}
                      className={`shrink-0 w-5 h-5 mt-0.5 rounded flex items-center justify-center transition-colors ${checkedPoints[tp.id] ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 text-transparent group-hover:border-[#0ea5e9]'}`}
                    >
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </button>
                    <span className={`text-sm select-none ${checkedPoints[tp.id] ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                      {tp.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* eKYC Results */}
            {ekycResult && (
              <div className="border-2 border-emerald-100 bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
                  <Scan size={18} />
                  <span>Kết quả Quét CCCD (FPT.AI)</span>
                </div>
                <div className="space-y-2 text-sm text-emerald-900">
                  <p><span className="font-semibold">Họ tên:</span> {ekycResult.name}</p>
                  <p><span className="font-semibold">Số CCCD:</span> {ekycResult.id}</p>
                  <p><span className="font-semibold">Ngày sinh:</span> {ekycResult.dob}</p>
                  <p><span className="font-semibold">Giới tính:</span> {ekycResult.sex}</p>
                  <p className="text-xs mt-2 opacity-80 border-t border-emerald-200 pt-2">
                    Mức độ tin cậy: Mọi trường &gt; 95%
                  </p>
                </div>
              </div>
            )}
            {scanMutation.isError && (
              <div className="border-2 border-rose-100 bg-rose-50 rounded-xl p-4 text-sm text-rose-700">
                <AlertTriangle size={18} className="mb-2" />
                Quét CCCD thất bại. Vui lòng kiểm tra lại ảnh hoặc thử lại sau.
              </div>
            )}
          </div>

          {/* Right Column: Documents */}
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Tài liệu đính kèm</h4>
            
            <div className="flex flex-col gap-6">
              {/* License Document for SME */}
              {isSME && company.documentUrl && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center text-sm">
                    <span>Giấy phép ĐKKD</span>
                    <a href={company.documentUrl} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Mở trong tab mới</a>
                  </div>
                  <div className="h-[400px]">
                    {company.documentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={company.documentUrl} alt="Giấy phép kinh doanh" className="w-full h-full object-contain p-4" />
                    ) : (
                      <iframe src={company.documentUrl} title="Document Viewer" className="w-full h-full" />
                    )}
                  </div>
                </div>
              )}

              {/* Auth Letter for ENTERPRISE */}
              {!isSME && company.authLetterUrl && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center text-sm">
                    <span>Giấy Ủy Quyền</span>
                    <a href={company.authLetterUrl} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Mở trong tab mới</a>
                  </div>
                  <div className="h-[400px]">
                    {company.authLetterUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={company.authLetterUrl} alt="Giấy ủy quyền" className="w-full h-full object-contain p-4" />
                    ) : (
                      <iframe src={company.authLetterUrl} title="Auth Letter" className="w-full h-full" />
                    )}
                  </div>
                </div>
              )}

              {/* ID Cards (Both Groups) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 text-sm flex justify-between items-center">
                    <span>CCCD Mặt Trước</span>
                    <button 
                      onClick={handleScan}
                      disabled={scanMutation.isPending}
                      className="flex items-center gap-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {scanMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />}
                      Quét eKYC
                    </button>
                  </div>
                  <div className="h-[250px] p-2 flex items-center justify-center bg-slate-50">
                    {company.idFrontUrl ? (
                      <img src={company.idFrontUrl} alt="CCCD Mặt trước" className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-slate-400 text-sm">Không có dữ liệu</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 text-sm">
                    CCCD Mặt Sau
                  </div>
                  <div className="h-[250px] p-2 flex items-center justify-center bg-slate-50">
                    {company.idBackUrl ? (
                      <img src={company.idBackUrl} alt="CCCD Mặt sau" className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-slate-400 text-sm">Không có dữ liệu</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          {showRejectBox ? (
            <div className="flex items-start gap-3 w-full">
              <div className="flex-1">
                <textarea 
                  autoFocus
                  placeholder="Nhập lý do từ chối hồ sơ này để gửi email thông báo cho HR..."
                  className="w-full border border-rose-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-400 resize-none h-20 bg-rose-50/30"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 w-32 shrink-0">
                <button 
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={14} /> Gửi
                </button>
                <button 
                  onClick={() => setShowRejectBox(false)}
                  className="w-full py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              {company.status === "Pending" && (
                <p className="text-xs text-slate-500 italic">
                  *Cần đánh dấu đủ {touchpoints.length} điểm chạm (Touchpoints) để kích hoạt nút Phê Duyệt.
                </p>
              )}
              <div className="flex justify-end gap-3 ml-auto">
                {company.status === "Pending" ? (
                  <>
                    <button 
                      onClick={() => setShowRejectBox(true)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      Từ Chối
                    </button>
                    <button 
                      onClick={() => onApprove(company.id)}
                      disabled={!allChecked}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0ea5e9] text-white hover:bg-[#0284c7] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Phê Duyệt
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
