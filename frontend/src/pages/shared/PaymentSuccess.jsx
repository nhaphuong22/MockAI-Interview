import { Link } from "react-router-dom";
import { CheckCircle2, Download, Home, Sparkles, ArrowRight, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function PaymentSuccess() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#0ea5e9", "#38bdf8", "#FFD700"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#0ea5e9", "#38bdf8", "#FFD700"],
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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-sky-50/30 to-white flex items-center justify-center p-6 md:p-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-16 text-center relative overflow-hidden border border-gray-100">
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"></div>

          <div className="mb-10">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative z-10 inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-200 animate-in zoom-in duration-700">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Thanh toán thành công!</h1>
            <p className="text-xl text-gray-500 font-medium">
              Chào mừng bạn đến với đặc quyền <span className="text-[#0ea5e9] font-bold">MockAI Pro</span>
            </p>
          </div>

          <div className="bg-gray-50/50 rounded-3xl p-8 mb-10 border border-gray-100">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Chi tiết giao dịch</h2>
            <div className="space-y-4 max-w-sm mx-auto text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Mã đơn hàng</span>
                <span className="font-bold text-[#0ea5e9]">#MAI-PRO-20260516</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Gói dịch vụ</span>
                <span className="font-bold text-gray-900">Pro Member (Tháng)</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Tổng thanh toán</span>
                <span className="font-bold text-gray-900">199.000 VNĐ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Ngày hết hạn</span>
                <span className="font-bold text-green-600">16/06/2026</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl p-8 mb-10 text-white shadow-xl shadow-sky-100 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <h3 className="text-lg font-bold">Quyền lợi Pro đã kích hoạt</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold opacity-80 uppercase mb-1">AI Phỏng vấn</div>
                <div className="text-sm font-bold">Vô hạn</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold opacity-80 uppercase mb-1">CV Builder</div>
                <div className="text-sm font-bold">Premium</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold opacity-80 uppercase mb-1">Hỗ trợ</div>
                <div className="text-sm font-bold">Ưu tiên</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/profile"
              className="px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-sky-100"
            >
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="px-10 py-4 border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              <span>Về trang chủ</span>
            </Link>
          </div>

          <div className="pt-8 border-t border-gray-50">
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Biên lai điện tử đã được gửi đến email của bạn. <br />
              Cần hỗ trợ? Liên hệ <a href="mailto:support@mockai.vn" className="text-[#0ea5e9] font-bold hover:underline">support@mockai.vn</a>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Chia sẻ khoảnh khắc này</p>
          <div className="flex gap-6 justify-center">
            <button className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-gray-200/50 hover:shadow-sky-100 hover:-translate-y-1 transition-all flex items-center justify-center border border-gray-50">
              <Share2 className="w-6 h-6 text-[#0ea5e9]" />
            </button>
            <button className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-gray-200/50 hover:shadow-sky-100 hover:-translate-y-1 transition-all flex items-center justify-center border border-gray-100">
               <div className="w-6 h-6 bg-[#0ea5e9] rounded-sm"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
