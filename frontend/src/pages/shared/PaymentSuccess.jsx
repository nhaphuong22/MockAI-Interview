import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Share2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);

  // Đọc thông tin kết quả thanh toán từ VNPAY
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  
  // Kiểm tra xem đây có phải là redirect từ cổng VNPAY hay không
  const isFromVnpay = vnpResponseCode !== null;
  // Thành công nếu không phải từ VNPAY (truy cập mock trực tiếp) hoặc mã phản hồi VNPAY là '00'
  const isSuccess = !isFromVnpay || vnpResponseCode === "00";

  // Định dạng hiển thị các thông tin giao dịch động
  const transactionCode = vnpTxnRef || "#MAI-PRO-20260516";
  
  const rawAmount = vnpAmount ? parseFloat(vnpAmount) / 100 : 199000;
  const displayAmount = rawAmount.toLocaleString("vi-VN") + " VNĐ";

  // Xác định gói dịch vụ và các đặc quyền tương ứng từ số tiền
  let planName = "Pro Member (Tháng)";
  let vipDurationDays = 30;
  let isRecruiterPlan = false;

  if (rawAmount >= 9000000) {
    planName = "Enterprise Plan (Năm)";
    vipDurationDays = 365;
    isRecruiterPlan = true;
  } else if (rawAmount >= 1990000) {
    planName = "Pro Member (Năm)";
    vipDurationDays = 365;
  } else if (rawAmount < 199000) {
    // Fallback cho test số tiền nhỏ hoặc gói basic
    planName = "Basic Member";
    vipDurationDays = 30;
  }

  // Tính toán ngày hết hạn (ngày hiện tại + thời hạn gói)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + vipDurationDays);
  const displayExpiry = expiryDate.toLocaleDateString("vi-VN");

  useEffect(() => {
    if (isSuccess && showConfetti) {
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
  }, [showConfetti, isSuccess]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-sky-50/20 to-white flex flex-col items-center justify-start py-8 md:py-16 px-4 md:px-8">
      {/* Wrapper chính trải rộng ngang hiện đại */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Viền màu trên cùng phân biệt trạng thái */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${isSuccess ? 'from-[#0ea5e9] to-[#38bdf8]' : 'from-red-500 to-rose-600'}`}></div>

        {/* Bố cục Split 2 cột: Cột trái thông điệp chính, cột phải chi tiết và quyền lợi */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          
          {/* CỘT TRÁI: THÔNG ĐIỆP TRẠNG THÁI & NÚT BẤM */}
          <div className={`col-span-1 md:col-span-5 p-8 md:p-12 flex flex-col items-center justify-center text-center relative border-b md:border-b-0 md:border-r border-gray-100 ${isSuccess ? 'bg-gradient-to-b from-sky-50/30 to-white' : 'bg-gradient-to-b from-red-50/10 to-white'}`}>
            
            {isSuccess ? (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg shadow-green-200 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Thanh toán thành công!</h1>
                <p className="text-gray-500 text-sm md:text-base font-medium mb-8 leading-relaxed">
                  Đặc quyền <span className="text-[#0ea5e9] font-bold">{isRecruiterPlan ? "MockAI Enterprise" : "MockAI Pro"}</span> của bạn đã sẵn sàng sử dụng.
                </p>

                {/* Các nút bấm CTA */}
                <div className="w-full space-y-3">
                  <Link
                    to={isRecruiterPlan ? "/hr/dashboard" : "/interview-practice"}
                    className="w-full py-3.5 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-100 cursor-pointer text-sm"
                  >
                    <span>Trải nghiệm ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/"
                    className="w-full py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center justify-center text-sm cursor-pointer"
                  >
                    <span>Về trang chủ</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-100 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full shadow-lg shadow-rose-200 animate-in zoom-in duration-500">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Thanh toán thất bại</h1>
                <p className="text-gray-500 text-sm md:text-base font-medium mb-8 leading-relaxed">
                  Giao dịch của bạn đã bị hủy hoặc gặp lỗi khi xử lý.
                </p>

                {/* Các nút bấm CTA */}
                <div className="w-full space-y-3">
                  <Link
                    to="/payment"
                    className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-100 cursor-pointer text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Thử thanh toán lại</span>
                  </Link>
                  <Link
                    to="/"
                    className="w-full py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center justify-center text-sm cursor-pointer"
                  >
                    <span>Về trang chủ</span>
                  </Link>
                </div>
              </>
            )}

            {/* Footer của cột trái */}
            <div className="mt-8 pt-6 border-t border-gray-100 w-full text-[10px] text-gray-400 text-center">
              Mã giao dịch: <span className="font-mono font-semibold text-gray-600">{transactionCode}</span>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT HÓA ĐƠN & QUYỀN LỢI */}
          <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-gray-50/30">
            
            <div className="space-y-6">
              {/* Box Chi tiết hóa đơn */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-left">Thông tin hóa đơn</h3>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
                    <span className="text-gray-400 font-medium">Mã đơn hàng VNPAY</span>
                    <span className="font-mono font-bold text-gray-900 select-all">{transactionCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
                    <span className="text-gray-400 font-medium">Gói dịch vụ</span>
                    <span className="font-bold text-gray-950">{planName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-gray-50">
                    <span className="text-gray-400 font-medium">Tổng thanh toán</span>
                    <span className="font-bold text-[#0ea5e9] text-sm font-mono">{displayAmount}</span>
                  </div>
                  {isSuccess && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Hạn sử dụng gói</span>
                      <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        {displayExpiry}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Box Quyền lợi kích hoạt (Chỉ hiển thị khi thành công) */}
              {isSuccess && (
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 text-left">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    Đặc quyền {isRecruiterPlan ? "Doanh nghiệp" : "VIP"} đã kích hoạt
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {isRecruiterPlan ? (
                      <>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-2xs">HR</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Đăng tin</div>
                            <div className="text-xs font-bold text-gray-900">Vô hạn</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-2xs">CV</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Tìm ứng viên</div>
                            <div className="text-xs font-bold text-gray-900">AI Parser</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-2xs">SUP</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Hỗ trợ</div>
                            <div className="text-xs font-bold text-gray-900">24/7</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-[#0ea5e9] font-bold text-2xs">AI</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Phỏng vấn</div>
                            <div className="text-xs font-bold text-gray-900">Vô hạn</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-[#0ea5e9] font-bold text-2xs">CV</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">CV Builder</div>
                            <div className="text-xs font-bold text-gray-900">Premium</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col items-center text-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-[#0ea5e9] font-bold text-2xs">HR</div>
                          <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Hỗ trợ</div>
                            <div className="text-xs font-bold text-gray-900">Ưu tiên</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer thông tin liên hệ và chia sẻ */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-gray-400 text-center sm:text-left leading-relaxed">
                Hóa đơn đã được xử lý tự động qua VNPAY. <br />
                Cần hỗ trợ? Liên hệ <a href="mailto:support@mockai.vn" className="text-[#0ea5e9] font-bold hover:underline">support@mockai.vn</a>
              </p>
              
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Chia sẻ:</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:text-[#0ea5e9] hover:bg-gray-50 transition-all cursor-pointer">
                    <Share2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-3.5 h-3.5 bg-[#0ea5e9] rounded-sm"></div>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
