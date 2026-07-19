import React, { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';

// Lấy Toast component từ react-hot-toast hoặc component tuỳ chỉnh của dự án.
// Giả định có react-toastify hoặc tương tự, ở đây dùng alert đơn giản nếu không import.
// Trong MockAI, toast thường được lấy từ react-hot-toast hoặc một context.
// Để tương thích cao nhất, sẽ render trực tiếp logic toast hoặc dùng callback.

const REPORT_REASONS = [
  'Lừa đảo, gian lận',
  'Spam, quảng cáo trái phép',
  'Ngôn từ kích động, xúc phạm',
  'Thông tin sai lệch',
  'Nội dung không phù hợp',
  'Khác'
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: (data) => reportApi.submitReport(data),
    onSuccess: (res) => {
      onSuccess?.();
      // Hiển thị thông báo thành công (Dự kiến: Toast)
      alert(res?.message || 'Gửi báo cáo thành công. Cảm ơn bạn đã đóng góp!');
      onClose();
    },
    onError: (error) => {
      // Hiển thị thông báo lỗi
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi gửi báo cáo.');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      alert('Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (selectedReason === 'Khác' && !description.trim()) {
      alert('Vui lòng nhập chi tiết mô tả lý do Khác.');
      return;
    }

    reportMutation.mutate({
      target_type: targetType,
      target_id: targetId,
      reason: selectedReason,
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold flex items-center text-slate-800 dark:text-slate-100">
            <Flag className="w-5 h-5 mr-2 text-red-500" />
            Báo cáo vi phạm
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Hãy cho chúng tôi biết tại sao nội dung này có vấn đề. Thông tin của bạn sẽ được giữ ẩn danh.
          </p>

          <div className="space-y-3 mb-4">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-[#0ea5e9] border-slate-300 focus:ring-[#0ea5e9] dark:border-slate-600 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{reason}</span>
              </label>
            ))}
          </div>

          {(selectedReason === 'Khác' || selectedReason !== '') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chi tiết bổ sung {selectedReason === 'Khác' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập thêm thông tin để chúng tôi dễ dàng xác minh..."
                className="w-full h-24 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent resize-none"
                required={selectedReason === 'Khác'}
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0ea5e9] hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi báo cáo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
