import { Link } from "react-router";
import { CheckCircle2, Download, Home, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function PaymentSuccess() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#E8580C", "#ff7a3d", "#FFD700"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#E8580C", "#ff7a3d", "#FFD700"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      setTimeout(() => setShowConfetti(false), duration);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-[#FFF3ED] to-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d]"></div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl mb-3">Thanh Toán Thành Công!</h1>
            <p className="text-xl text-gray-600">
              Cảm ơn bạn đã nâng cấp lên <span className="text-[#E8580C] font-semibold">JobBridge Pro</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FFF3ED] to-white rounded-2xl p-8 mb-8 border-2 border-[#E8580C]/20">
            <h2 className="text-lg mb-6">Thông Tin Đơn Hàng</h2>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Mã giao dịch</span>
                <span className="font-semibold text-[#E8580C]">#JB-20260512-001</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Gói</span>
                <span className="font-semibold">Pro Monthly</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Số tiền</span>
                <span className="font-semibold">199,000 VND</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Hiệu lực đến</span>
                <span className="font-semibold">12/06/2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phương thức</span>
                <span className="font-semibold">VISA ****4242</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg">Các Tính Năng Pro Đã Được Kích Hoạt</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold mb-1">Unlimited CV</div>
                <div className="text-xs opacity-90">Tạo không giới hạn</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold mb-1">AI Interview</div>
                <div className="text-xs opacity-90">Luyện tập miễn phí</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-semibold mb-1">Priority Support</div>
                <div className="text-xs opacity-90">Hỗ trợ ưu tiên</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              to="/profile"
              className="px-8 py-4 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Khám Phá Tính Năng Pro</span>
            </Link>
            <Link
              to="/"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] hover:text-[#E8580C] transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Về Trang Chủ</span>
            </Link>
          </div>

          <Link
            to="/payment"
            className="text-[#E8580C] hover:underline text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Xem lịch sử thanh toán</span>
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Hóa đơn đã được gửi đến email của bạn.
              <br />
              Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ{" "}
              <a href="mailto:support@jobbridge.vn" className="text-[#E8580C] hover:underline">
                support@jobbridge.vn
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Chia sẻ thành công của bạn</p>
          <div className="flex gap-4 justify-center">
            <button className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center">
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center">
              <svg className="w-6 h-6" fill="#1DA1F2" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center">
              <svg className="w-6 h-6" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
