import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, AlertTriangle, Clock, RefreshCw, ArrowRight, Check, ShieldCheck
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';
import { AuthModal } from '../../components/auth/AuthModal';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const authModalOpen = useUiStore((state) => state.authModalOpen);
  const authModalMode = useUiStore((state) => state.authModalMode);
  const closeAuthModal = useUiStore((state) => state.closeAuthModal);
  const { user, logout } = useAuthStore();

  // Verify invitation token
  const { data: verifyData, isLoading: isLoadingVerify } = useQuery({
    queryKey: ['verifyInvitation', token],
    queryFn: async () => {
      const res = await axiosClient.get(`/auth/invitations/verify?token=${token}`);
      return res.data;
    },
    enabled: !!token,
    retry: false
  });

  const queryClient = useQueryClient();

  // Accept invitation mutation (for creating a new user OR linking an existing user)
  const acceptMutation = useMutation({
    mutationFn: async (payload) => {
      return axiosClient.post('/auth/invitations/accept', payload);
    },
    onSuccess: (res) => {
      const responseData = res?.data || res;
      const message = res?.message || responseData?.message || 'Kích hoạt/Liên kết tài khoản thành công!';
      showToast(message, 'success');

      const updatedUser = responseData?.user;
      const newToken = responseData?.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
      }
      if (updatedUser) {
        useAuthStore.getState().setAuth(updatedUser);
      }
      queryClient.clear();
      navigate('/hr/dashboard/company-profile');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận lời mời.', 'error');
    }
  });

  const handleAcceptSubmit = () => {
    if (!token) return;
    acceptMutation.mutate({ token });
  };

  if (isLoadingVerify) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#0ea5e9] animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Đang xác thực thông tin thư mời...</p>
        </div>
      </div>
    );
  }

  // Handle errors / token issues
  if (!token || !verifyData || verifyData.valid === false) {
    const reason = verifyData?.reason; // EXPIRED | ACCEPTED | CANCELLED
    const title = reason === 'EXPIRED' ? 'Lời mời đã hết hạn' : (reason === 'ACCEPTED' ? 'Lời mời đã sử dụng' : 'Lời mời không hợp lệ');
    const desc = reason === 'EXPIRED' 
      ? 'Thời hạn kích hoạt lời mời (24 giờ) đã trôi qua. Vui lòng liên hệ HR gốc của công ty để nhận lại thư mời mới.'
      : (reason === 'ACCEPTED' 
          ? 'Tài khoản con này đã được kích hoạt/liên kết thành công trước đó.' 
          : 'Đường dẫn liên kết không tồn tại hoặc đã bị quản trị viên hủy bỏ.');

    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl shadow-sky-500/5"
        >
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            {reason === 'EXPIRED' ? <Clock size={40} /> : <AlertTriangle size={40} />}
          </div>
          <h2 className="text-2xl font-black text-white mb-3">{title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">{desc}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/20"
          >
            Về Trang Chủ
          </button>
        </motion.div>
      </div>
    );
  }

  // Unified flow for all users
  const isCurrentUserMatching = user && user.email === verifyData?.email;

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-sky-500/5"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Thư Mời Gia Nhập</h2>
          <p className="text-slate-400 text-sm mt-2">
            Bạn nhận được lời mời gia nhập doanh nghiệp con
          </p>
          <div className="mt-4 p-4 bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl">
            <Building2 className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
            <p className="font-extrabold text-white uppercase text-base">{verifyData?.companyName}</p>
          </div>
        </div>

        <div className="space-y-6">
          {!user ? (
            // 1. If not logged in
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-semibold leading-relaxed">
                * Vui lòng đăng nhập hoặc tạo tài khoản mới bằng email <strong className="text-white">{verifyData?.email}</strong> để tiếp tục xác nhận gia nhập.
              </div>
              <button
                onClick={() => useUiStore.getState().openAuthModal({ mode: 'login' })}
                className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
              >
                Đăng Nhập / Đăng Ký <ArrowRight size={18} />
              </button>
            </div>
          ) : !isCurrentUserMatching ? (
            // 2. Logged in with wrong account
            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed text-left">
                Bạn đang đăng nhập bằng tài khoản <strong className="text-white">{user.email}</strong>.<br/>
                Tuy nhiên, lời mời này dành cho tài khoản <strong className="text-white">{verifyData?.email}</strong>. Vui lòng đăng xuất và đăng nhập lại bằng tài khoản chính xác để thực hiện.
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all"
              >
                Đăng Xuất Tài Khoản Hiện Tại
              </button>
            </div>
          ) : (
            // 3. Logged in with matching account -> Allow linking (Confirm/Reject)
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                <Check className="shrink-0 text-emerald-400 mt-0.5" size={16} />
                <span>Xác nhận liên kết tài khoản <strong className="text-white">{verifyData?.email}</strong> với doanh nghiệp <strong>{verifyData?.companyName}</strong>. Bạn sẽ có vai trò tuyển dụng (HR phụ).</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700"
                >
                  Từ chối
                </button>
                <button
                  onClick={handleAcceptSubmit}
                  disabled={acceptMutation.isPending}
                  className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50"
                >
                  {acceptMutation.isPending ? 'Đang xử lý...' : 'Đồng ý'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <AuthModal
        isOpen={authModalOpen}
        onOpenChange={closeAuthModal}
        initialMode={authModalMode}
        noRedirect={true}
      />
    </div>
  );
}
