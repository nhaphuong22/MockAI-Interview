import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Lock, User, Phone, AlertTriangle, Clock, RefreshCw, ArrowRight, Check, ShieldCheck
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const { user, logout } = useAuthStore();

  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('OTHER');

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

  // Accept invitation mutation (for creating a new user OR linking an existing user)
  const acceptMutation = useMutation({
    mutationFn: async (payload) => {
      return axiosClient.post('/auth/invitations/accept', payload);
    },
    onSuccess: (res) => {
      showToast(res.data?.message || 'Kích hoạt/Liên kết tài khoản thành công!', 'success');
      // Redirect to login or company profile depending on status
      if (verifyData?.isAlreadyRegistered) {
        // If they were already logged in, redirect them to the company profile page
        navigate('/hr/dashboard/company-profile');
      } else {
        // For new users, redirect to landing page and they can log in
        navigate('/');
      }
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận lời mời.', 'error');
    }
  });

  const handleAcceptSubmit = (e) => {
    e.preventDefault();
    if (!token) return;

    if (verifyData?.isAlreadyRegistered) {
      // If already registered and authenticated, just send token
      acceptMutation.mutate({ token });
    } else {
      // For new users, validate form fields
      if (!password || !fullName) {
        showToast('Vui lòng nhập mật khẩu và họ tên để kích hoạt tài khoản.', 'error');
        return;
      }
      acceptMutation.mutate({
        token,
        password,
        fullName,
        phone,
        gender
      });
    }
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

  // Flow A: Existing Account Link (Auto-route link)
  if (verifyData.isAlreadyRegistered) {
    const isCurrentUserMatching = user && user.email === verifyData.email;

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
            <h2 className="text-2xl font-black text-white tracking-tight">Liên Kết Tài Khoản</h2>
            <p className="text-slate-400 text-sm mt-2">
              Bạn nhận được lời mời gia nhập doanh nghiệp con
            </p>
            <div className="mt-4 p-4 bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl">
              <Building2 className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
              <p className="font-extrabold text-white uppercase text-base">{verifyData.companyName}</p>
            </div>
          </div>

          <div className="space-y-6">
            {!user ? (
              // 1. If not logged in
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-semibold leading-relaxed">
                  * Hệ thống nhận diện email <strong className="text-white">{verifyData.email}</strong> đã tồn tại trên hệ thống. Vui lòng đăng nhập tài khoản này để hoàn tất liên kết.
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  Đăng Nhập Ngay <ArrowRight size={18} />
                </button>
              </div>
            ) : !isCurrentUserMatching ? (
              // 2. Logged in with wrong account
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed text-left">
                  Bạn đang đăng nhập bằng tài khoản <strong className="text-white">{user.email}</strong>.<br/>
                  Tuy nhiên, lời mời này dành cho tài khoản <strong className="text-white">{verifyData.email}</strong>. Vui lòng đăng xuất và đăng nhập lại bằng tài khoản chính xác để thực hiện.
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
              // 3. Logged in with matching account -> Allow linking
              <form onSubmit={handleAcceptSubmit} className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                  <Check className="shrink-0 text-emerald-400 mt-0.5" size={16} />
                  <span>Xác nhận liên kết tài khoản <strong className="text-white">{verifyData.email}</strong> với doanh nghiệp <strong>{verifyData.companyName}</strong>. Bạn sẽ có vai trò tuyển dụng (HR phụ).</span>
                </div>
                <button
                  type="submit"
                  disabled={acceptMutation.isPending}
                  className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {acceptMutation.isPending ? 'Đang thực hiện liên kết...' : 'Đồng Ý Liên Kết Doanh Nghiệp'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Flow B: New Account Registration under Company
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center py-12 px-4 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-sky-500/5 relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Kích Hoạt Tài Khoản HR</h2>
          <p className="text-slate-400 text-sm mt-1">
            Gia nhập doanh nghiệp trực thuộc
          </p>
          <div className="mt-3 p-3 bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl inline-block">
            <p className="font-extrabold text-[#0ea5e9] uppercase text-xs tracking-wider">{verifyData.companyName}</p>
          </div>
        </div>

        <form onSubmit={handleAcceptSubmit} className="space-y-5">
          {/* Email (Disabled/Read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Email Tài Khoản</label>
            <input
              type="text"
              disabled
              value={verifyData.email}
              className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/5 rounded-xl text-slate-400 font-semibold cursor-not-allowed text-sm"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Họ và Tên *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                required
                placeholder="Nhập họ và tên..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 text-white font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Mật Khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="password"
                required
                placeholder="Thiết lập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 text-white font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Số Điện Thoại</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Nhập số điện thoại (tùy chọn)..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 text-white font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Giới Tính</label>
            <div className="grid grid-cols-3 gap-3">
              {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all ${gender === g 
                    ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9]' 
                    : 'border-white/5 bg-[#0f172a]/50 text-slate-400 hover:border-white/10'}`}
                >
                  {g === 'MALE' ? 'Nam' : (g === 'FEMALE' ? 'Nữ' : 'Khác')}
                </button>
              ))}
            </div>
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            disabled={acceptMutation.isPending}
            className="w-full py-4 mt-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {acceptMutation.isPending ? 'Đang tạo tài khoản...' : 'Kích Hoạt Tài Khoản Mới'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
