import { Check, X, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Switch from "@radix-ui/react-switch";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "FREE",
    price: { monthly: 0, yearly: 0 },
    popular: false,
    features: [
      { text: "1 CV", included: true },
      { text: "3 AI reviews/tháng", included: true },
      { text: "5 đơn ứng tuyển", included: true },
      { text: "AI phỏng vấn thử", included: false },
      { text: "Priority listing", included: false },
      { text: "Hỗ trợ 24/7", included: false },
    ],
    cta: "Đang Sử Dụng",
    ctaStyle: "border-2 border-gray-300 text-gray-700 cursor-not-allowed",
  },
  {
    id: "pro",
    name: "PRO",
    price: { monthly: 199000, yearly: 1990000 },
    popular: true,
    features: [
      { text: "Unlimited CV", included: true },
      { text: "Unlimited AI reviews", included: true },
      { text: "Unlimited ứng tuyển", included: true },
      { text: "AI phỏng vấn thử", included: true },
      { text: "Priority listing", included: true },
      { text: "Hỗ trợ ưu tiên", included: true },
    ],
    cta: "Nâng Cấp Ngay",
    ctaStyle: "bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white hover:shadow-xl",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: { monthly: null, yearly: null },
    popular: false,
    features: [
      { text: "Tất cả tính năng Pro", included: true },
      { text: "Team management", included: true },
      { text: "Custom AI model", included: true },
      { text: "Dedicated support", included: true },
      { text: "API access", included: true },
      { text: "White label", included: true },
    ],
    cta: "Liên Hệ Chúng Tôi",
    ctaStyle: "border-2 border-[#E8580C] text-[#E8580C] hover:bg-[#FFF3ED]",
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");

  const handlePurchase = () => {
    if (selectedPlan === "pro") {
      navigate("/payment-success");
    }
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">Chọn Gói Phù Hợp Với Bạn</h1>
          <p className="text-xl text-gray-600 mb-8">
            Nâng cấp để mở khóa tất cả tính năng và tăng cơ hội tìm việc
          </p>

          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 border-2 border-gray-200">
            <span className={`px-4 ${!isYearly ? "font-semibold" : "text-gray-600"}`}>
              Hàng Tháng
            </span>
            <Switch.Root
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="w-14 h-7 bg-gray-300 rounded-full relative data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#E8580C] data-[state=checked]:to-[#ff7a3d] transition-colors"
            >
              <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[30px] shadow-md" />
            </Switch.Root>
            <span className={`px-4 ${isYearly ? "font-semibold" : "text-gray-600"}`}>
              Hàng Năm
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                Tiết kiệm 17%
              </span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-8 relative transition-all ${
                plan.popular
                  ? "border-2 border-[#E8580C] shadow-2xl scale-105"
                  : "border-2 border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-full text-sm font-semibold">
                  Phổ Biến Nhất
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl mb-4">{plan.name}</h3>
                <div className="mb-2">
                  {plan.price.monthly === null ? (
                    <div className="text-3xl">Liên Hệ</div>
                  ) : (
                    <>
                      <span className="text-4xl">
                        {isYearly
                          ? (plan.price.yearly / 12).toLocaleString("vi-VN")
                          : plan.price.monthly.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-gray-600">đ/tháng</span>
                    </>
                  )}
                </div>
                {plan.price.monthly !== null && isYearly && (
                  <p className="text-sm text-gray-600">
                    Thanh toán {plan.price.yearly.toLocaleString("vi-VN")}đ/năm
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className={feature.included ? "" : "text-gray-400"}>{feature.text}</span>
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
                className={`w-full py-3 rounded-xl transition-all ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {selectedPlan === "pro" && (
          <div id="checkout" className="max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#E8580C]">
              <h2 className="text-2xl mb-6">Thanh Toán</h2>

              <div className="mb-6">
                <h3 className="font-semibold mb-4">Phương thức thanh toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "card"
                        ? "border-[#E8580C] bg-[#FFF3ED]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "card" ? "text-[#E8580C]" : "text-gray-400"}`} />
                    <div className="text-sm">Thẻ Tín Dụng</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "qr"
                        ? "border-[#E8580C] bg-[#FFF3ED]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "qr" ? "text-[#E8580C]" : "text-gray-400"}`} />
                    <div className="text-sm">QR Code</div>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm mb-2">Số thẻ</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Ngày hết hạn</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "qr" && (
                <div className="mb-6 text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-6xl">📱</div>
                  </div>
                  <p className="text-gray-600">Quét mã QR để thanh toán qua VNPay/Momo</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span>Gói Pro ({isYearly ? "Năm" : "Tháng"})</span>
                  <span className="font-semibold">
                    {isYearly ? "1,990,000đ" : "199,000đ"}
                  </span>
                </div>
                {isYearly && (
                  <div className="flex items-center justify-between text-sm text-green-600 mb-2">
                    <span>Tiết kiệm</span>
                    <span>-398,000đ</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex items-center justify-between text-lg">
                    <span>Tổng cộng</span>
                    <span className="font-semibold text-[#E8580C]">
                      {isYearly ? "1,990,000đ" : "199,000đ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span>Thanh toán an toàn với mã hóa SSL 256-bit</span>
              </div>

              <button
                onClick={handlePurchase}
                className="w-full py-4 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                Xác Nhận Thanh Toán
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">
                    SSL
                  </div>
                  <span>Bảo mật</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">
                    VP
                  </div>
                  <span>VNPay</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">
                    MM
                  </div>
                  <span>Momo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl text-center mb-8">Câu Hỏi Thường Gặp</h2>
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
              >
                <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <span className="font-semibold text-left">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-4 text-gray-600">
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
