import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUiStore } from '../../../store/useUiStore';

export function DataPrivacyTab({ onComplete }) {
  const { user, setAuth } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);
  const queryClient = useQueryClient();
  
  const [agreed, setAgreed] = useState(!!user?.privacy_agreed);

  useEffect(() => {
    setAgreed(!!user?.privacy_agreed);
    if (user?.privacy_agreed && onComplete) {
      onComplete();
    }
  }, [user?.privacy_agreed, onComplete]);

  const acceptMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosClient.post('/auth/privacy-agreement', payload);
      return res;
    },
    onSuccess: (data) => {
      showToast({ message: 'Cập nhật thoả thuận dữ liệu thành công!', type: 'success' });
      if (data.user) {
        setAuth(data.user);
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  });

  const handleAccept = () => {
    acceptMutation.mutate({ agreed });
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm w-full">
      {/* Title & Badge */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[17px] font-bold text-slate-800 dark:text-white">
          Văn bản Thoả thuận xử lý Dữ liệu cá nhân giữa MockAI - Nhà tuyển dụng
        </h2>
        {user?.privacy_agreed ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[13px] font-medium rounded-full">
            <CheckCircle2 size={14} />
            Đã xác nhận
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[13px] font-medium rounded-full">
            Chưa xác nhận
          </span>
        )}
      </div>

      {/* Paragraph Text */}
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
        Nhằm tuân thủ Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, MockAI chính thức triển khai Thỏa thuận về xử lý dữ liệu cá nhân trên hệ thống. Thỏa thuận này làm rõ vai trò, trách nhiệm của Quý đơn vị và MockAI đối với các hồ sơ ứng viên được chuyển vào Không gian làm việc (Workspace) của Quý đơn vị. Vui lòng đọc kỹ và xác nhận đồng ý để đảm bảo tiến trình tuyển dụng diễn ra hợp pháp, minh bạch và không bị gián đoạn.
      </p>

      {/* Full Document Link */}
      <Link to="/data-privacy-agreement" target="_blank" className="inline-flex items-center gap-1.5 text-[#0ea5e9] hover:underline font-medium text-sm mb-6">
        Xem nội dung đầy đủ của văn bản <ExternalLink size={14} />
      </Link>

      {/* Checkbox Area */}
      <div className="flex items-center gap-3 mb-8">
        <input 
          type="checkbox" 
          id="privacy-agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={acceptMutation.isPending}
          className="w-5 h-5 rounded border-slate-300 text-[#0ea5e9] focus:ring-[#0ea5e9] cursor-pointer disabled:opacity-50"
        />
        <label htmlFor="privacy-agree" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          Tôi đã đọc, hiểu rõ và đồng ý với nội dung của <span className="text-[#0ea5e9]">Văn bản xử lý dữ liệu cá nhân</span>
        </label>
      </div>

      {/* Action Button */}
      {agreed !== !!user?.privacy_agreed && (
        <div className="flex justify-end">
          <button 
            disabled={acceptMutation.isPending}
            onClick={handleAccept}
            className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              ${agreed 
                ? 'bg-[#0ea5e9] hover:bg-[#0284c7]' 
                : 'bg-rose-500 hover:bg-rose-600'
              }`}
          >
            {acceptMutation.isPending && <Loader2 size={18} className="animate-spin" />}
            {agreed ? "Lưu xác nhận" : "Rút lại xác nhận"}
          </button>
        </div>
      )}
    </div>
  );
}
