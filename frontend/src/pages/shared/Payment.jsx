import { Check, X, CreditCard, Smartphone, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Switch from "@radix-ui/react-switch";
import * as Accordion from "@radix-ui/react-accordion";

const plans = [
  {
    id: "free",
    name: "MIỄN PHÍ",
    price: { monthly: 0, yearly: 0 },
    popular: false,
    features: [
      { text: "1 CV chuyên nghiệp", included: true },
      { text: "3 lượt AI review/tháng", included: true },
      { text: "5 đơn ứng tuyển/tháng", included: true },
      { text: "AI phỏng vấn thử", included: false },
      { text: "Ưu tiên hiển thị", included: false },
      { text: "Hỗ trợ 24/7", included: false },
    ],
    cta: "Gói Hiện Tại",
    ctaStyle: "border-2 border-gray-100 text-gray-400 cursor-not-allowed font-bold",
  },
  {
    id: "pro",
    name: "HỘI VIÊN PRO",
    price: { monthly: 199000, yearly: 1990000 },
    popular: true,
    features: [
      { text: "Không giới hạn CV", included: true },
      { text: "Không giới hạn AI review", included: true },
      { text: "Không giới hạn ứng tuyển", included: true },
      { text: "AI phỏng vấn thử (Unlimited)", included: true },
      { text: "Ưu tiên hiển thị hồ sơ", included: true },
      { text: "Hỗ trợ kỹ thuật ưu tiên", included: true },
    ],
    cta: "Nâng Cấp Ngay",
    ctaStyle: "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-lg shadow-sky-100",
  },
  {
    id: "enterprise",
    name: "DOANH NGHIỆP",
    price: { monthly: null, yearly: null },
    popular: false,
    features: [
      { text: "Tất cả tính năng Pro", included: true },
      { text: "Quản lý nhóm tuyển dụng", included: true },
      { text: "Tùy chỉnh mô hình AI", included: true },
      { text: "Hỗ trợ chuyên gia riêng", included: true },
      { text: "Truy cập API hệ thống", included: true },
      { text: "White label branding", included: true },
    ],
    cta: "Liên Hệ Tư Vấn",
    ctaStyle: "border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold hover:bg-sky-50",
  },
];

const faqs = [
  {
    question: "Tôi có thể hủy gói Pro bất cứ lúc nào không?",
    answer: "Có, bạn có thể hủy gói Pro bất cứ lúc nào. Gói sẽ vẫn hoạt động đến hết chu kỳ thanh toán hiện tại.",
  },
  {
    question: "Có chính sách hoàn tiền không?",
    answer: "Chúng tôi cung cấp chính sách hoàn tiền 100% trong vòng 14 ngày đầu tiên nếu bạn không hài lòng với dịch vụ.",
  },
  {
    question: "Tôi có thể thay đổi từ gói tháng sang gói năm không?",
    answer: "Có, bạn có thể nâng cấp lên gói năm bất cứ lúc nào. Số tiền đã thanh toán cho gói tháng sẽ được trừ vào gói năm.",
  },
  {
    question: "Các phương thức thanh toán được hỗ trợ?",
    answer: "Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng/ghi nợ (Visa, Mastercard), VNPay, Momo, và chuyển khoản ngân hàng.",
  },
];

export function Payment() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handlePurchase = () => {
    if (selectedPlan === "pro") {
      navigate("/payment-success");
    }
  };

  return (
    <div className="bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Chọn Gói Phù Hợp Với Bạn</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nâng cấp để mở khóa tất cả tính năng AI và tăng 80% cơ hội tìm việc thành công
          </p>

          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1.5 border border-gray-200 shadow-sm">
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? "bg-[#0ea5e9] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              Hàng Tháng
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isYearly ? "bg-[#0ea5e9] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              Hàng Năm
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] uppercase">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 relative transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-[#0ea5e9] shadow-2xl scale-105 z-10"
                  : "border border-gray-100 shadow-lg hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0ea5e9] text-white rounded-full text-xs font-bold uppercase tracking-wider">
                  Khuyên dùng
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.price.monthly === null ? (
                    <div className="text-3xl font-bold">Liên Hệ</div>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {isYearly
                          ? Math.floor(plan.price.yearly / 12).toLocaleString("vi-VN")
                          : plan.price.monthly.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-gray-500 font-medium">đ/tháng</span>
                    </>
                  )}
                </div>
                {plan.price.monthly !== null && isYearly && (
                  <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 inline-block px-3 py-1 rounded-full">
                    Tiết kiệm {Math.floor(plan.price.monthly * 12 - plan.price.yearly).toLocaleString("vi-VN")}đ mỗi năm
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#0ea5e9]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(plan.id);
                  if (plan.id === "pro") {
                    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                disabled={plan.id === "free"}
                className={`w-full py-4 rounded-2xl transition-all active:scale-[0.98] ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {selectedPlan === "pro" && (
          <div id="checkout" className="max-w-2xl mx-auto mb-20 scroll-mt-20">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-sky-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-sky-600" />
                </div>
                Thông tin thanh toán
              </h2>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Phương thức</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 border-2 rounded-2xl transition-all text-center ${
                      paymentMethod === "card"
                        ? "border-[#0ea5e9] bg-sky-50 shadow-md"
                        : "border-gray-50 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "card" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                    <div className={`text-sm font-bold ${paymentMethod === "card" ? "text-sky-900" : "text-gray-600"}`}>Thẻ ngân hàng</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`p-4 border-2 rounded-2xl transition-all text-center ${
                      paymentMethod === "qr"
                        ? "border-[#0ea5e9] bg-sky-50 shadow-md"
                        : "border-gray-50 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "qr" ? "text-[#0ea5e9]" : "text-gray-300"}`} />
                    <div className={`text-sm font-bold ${paymentMethod === "qr" ? "text-sky-900" : "text-gray-600"}`}>Ví điện tử / QR</div>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Số thẻ</label>
                    <input
                      type="text"
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hạn dùng</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">CVC/CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#0ea5e9] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "qr" && (
                <div className="mb-8 p-8 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-sm mb-4">
                    <div className="w-full h-full bg-sky-50 flex items-center justify-center text-sky-200">
                      <Smartphone className="w-12 h-12" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700">Quét mã bằng ứng dụng Ngân hàng</p>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ VNPay, MoMo, ZaloPay</p>
                </div>
              )}

              <div className="bg-sky-50 rounded-2xl p-6 mb-8 border border-sky-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">Gói PRO ({isYearly ? "12 tháng" : "1 tháng"})</span>
                  <span className="font-bold text-gray-900">
                    {isYearly ? "1,990,000đ" : "199,000đ"}
                  </span>
                </div>
                {isYearly && (
                  <div className="flex items-center justify-between text-sm text-green-600 font-bold mb-3">
                    <span>Ưu đãi thanh toán năm (-17%)</span>
                    <span>-398,000đ</span>
                  </div>
                )}
                <div className="border-t border-sky-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Tổng thanh toán</span>
                    <span className="text-2xl font-bold text-[#0ea5e9]">
                      {isYearly ? "1,990,000đ" : "199,000đ"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                className="w-full py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl text-lg hover:bg-[#0284c7] hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-sky-100"
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 uppercase tracking-widest">Hỗ trợ giải đáp</h2>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all group outline-none">
                  <span className="font-bold text-left text-gray-700 group-data-[state=open]:text-[#0ea5e9] transition-colors">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#0ea5e9] transition-all" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-5 text-sm text-gray-600 leading-relaxed animate-in slide-in-from-top-2">
                  {faq.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
}
