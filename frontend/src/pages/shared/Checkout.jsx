import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Ticket, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import { useUiStore } from '../../store/useUiStore';
import { useAuthStore } from '../../store/useAuthStore';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUiStore();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch package details
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await paymentApi.getPackages();
      return response.data;
    }
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedPackage = packages?.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (!isLoading && !selectedPackage) {
      showToast({ message: 'Gói cước không tồn tại', type: 'error' });
      navigate('/packages');
    }
  }, [isLoading, selectedPackage, navigate, showToast]);

  if (isLoading || !selectedPackage) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  const originalPrice = parseFloat(selectedPackage.price);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const isHr = user?.role === 'HR';

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast({ message: 'Vui lòng nhập mã giảm giá', type: 'warning' });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await paymentApi.validateCoupon({
        code: couponCode,
        packageId: selectedPackage.id
      });

      if (res.success) {
        setAppliedCoupon(res.data);
        showToast({ message: 'Áp dụng mã giảm giá thành công!', type: 'success' });
      }
    } catch (error) {
      setAppliedCoupon(null);
      showToast({
        message: error.response?.data?.message || 'Mã giảm giá không hợp lệ',
        type: 'error'
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        packageId: selectedPackage.id,
        ...(appliedCoupon && { couponCode: appliedCoupon.code })
      };

      const response = await paymentApi.createVnpayUrl(payload);

      if (response.isFreeActivation) {
        showToast({ message: 'Kích hoạt gói cước thành công!', type: 'success' });
        navigate(`/payment-success?vnp_Amount=0&vnp_ResponseCode=00&vnp_TxnRef=FREE-${Date.now()}&planName=${encodeURIComponent(selectedPackage.name)}`);
      } else if (response.success && response.paymentUrl) {
        window.location.assign(response.paymentUrl);
      } else {
        showToast({ message: 'Không thể khởi tạo thanh toán.', type: 'error' });
      }
    } catch (error) {
      showToast({
        message: error.response?.data?.message || 'Lỗi kết nối cổng thanh toán.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-2 pb-6 px-4 sm:px-6 lg:px-8 relative h-[calc(100vh-64px)] overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-200/30 dark:bg-sky-900/20 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/packages')}
          className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại chọn gói
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Order Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tóm tắt đơn hàng</h2>

              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="text-xl font-bold text-[#0ea5e9] mb-2">{selectedPackage.name}</h3>
                  {isHr ? (
                    <p className="text-gray-600 dark:text-gray-400">Nạp {selectedPackage.total_credits} Credit tuyển dụng</p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Gói nâng cấp {selectedPackage.duration_days} ngày</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {originalPrice.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Quyền lợi gói cước:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Mở khóa toàn bộ tính năng cao cấp</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Hỗ trợ kỹ thuật ưu tiên 24/7</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Thanh toán an toàn qua VNPAY</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-100 dark:border-sky-800/50 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-[#0ea5e9] flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Bảo mật thanh toán</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mọi giao dịch của bạn được mã hóa và xử lý an toàn bởi đối tác thanh toán VNPAY. Chúng tôi không lưu trữ thông tin thẻ của bạn.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Coupon */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-2xl sticky top-8">

              {/* Coupon Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Mã giảm giá
                </h3>

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã (VD: MOCKAI50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-green-700 dark:text-green-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã áp dụng mã {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">Giảm {appliedCoupon.discount_percent}%</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Bỏ mã giảm giá"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span className="font-medium">{originalPrice.toLocaleString('vi-VN')} đ</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Giảm giá ({appliedCoupon.code})</span>
                    <span>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Tổng thanh toán</span>
                  <span className="text-3xl font-extrabold text-[#0ea5e9]">
                    {finalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[#0ea5e9] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0284c7] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-sky-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang kết nối...
                  </>
                ) : finalPrice === 0 ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Kích Hoạt Miễn Phí
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Thanh Toán Qua VNPAY
                  </>
                )}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
