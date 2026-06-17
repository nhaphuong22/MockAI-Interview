import { Check, X, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { useQuery } from "@tanstack/react-query";
import paymentApi from "../../api/paymentApi";
import { useUiStore } from "../../store/useUiStore";

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

const mapFeatures = (pkg) => {
  const features = [];
  if (pkg.target_role === 'CANDIDATE') {
    features.push({
      text: pkg.ats_scan_limit === null ? "Chấm điểm ATS không giới hạn" : `${pkg.ats_scan_limit} lượt chấm điểm ATS`,
      included: pkg.ats_scan_limit !== 0
    });
    features.push({
      text: pkg.ai_cover_letter_limit === null ? "Cover Letter AI không giới hạn" : `${pkg.ai_cover_letter_limit} lượt tạo Cover Letter AI`,
      included: pkg.ai_cover_letter_limit !== 0
    });
    features.push({
      text: pkg.ai_practice_limit === null ? "Luyện phỏng vấn AI không giới hạn" : `${pkg.ai_practice_limit} lượt luyện phỏng vấn AI`,
      included: pkg.ai_practice_limit !== 0
    });
    features.push({
      text: `Phân tích năng lực ${pkg.radar_chart_level === 'ADVANCED' ? 'Chuyên sâu' : pkg.radar_chart_level === 'DETAILED' ? 'Chi tiết' : 'Cơ bản'}`,
      included: true
    });
  } else {
    features.push({
      text: pkg.job_post_limit === null ? "Đăng tin không giới hạn" : `${pkg.job_post_limit} tin tuyển dụng`,
      included: pkg.job_post_limit !== 0
    });
    features.push({
      text: "Lọc CV bằng AI",
      included: pkg.ai_screening_enabled
    });
    features.push({
      text: "Gửi Email tự động",
      included: pkg.bulk_email_automation
    });
    features.push({
      text: "Phỏng vấn ứng viên bằng AI",
      included: pkg.ai_interview_enabled
    });
  }
  return features;
};

export function Payment() {
  const { showToast } = useUiStore();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Fetch packages from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await paymentApi.getPackages();
      return response.data; // Mảng các packages
    }
  });

  // Xử lý gói hiển thị
  // Gói tháng: duration_days === 30, gói năm: duration_days === 365
  // Đối với gói Free/Starter, luôn hiển thị dù chọn tháng hay năm
  const packages = data || [];
  
  // Phân loại
  const freePlan = packages.find(p => p.price === "0.00" || p.price === 0);
  const paidPlans = packages.filter(p => p.price !== "0.00" && p.price !== 0);

  // Chọn gói trả phí tương ứng (Tháng / Năm)
  const monthlyPlans = paidPlans.filter(p => p.duration_days === 30);
  const yearlyPlans = paidPlans.filter(p => p.duration_days === 365);

  // Gom các gói lại để hiển thị
  let displayPlans = [];
  if (freePlan) {
    displayPlans.push({
      ...freePlan,
      mappedFeatures: mapFeatures(freePlan),
      cta: "Gói Hiện Tại",
      ctaStyle: "border-2 border-gray-100 text-gray-400 cursor-not-allowed font-bold"
    });
  }

  const activePaidPlans = isYearly ? yearlyPlans : monthlyPlans;
  
  // Tùy chỉnh hiển thị cho các gói trả phí
  activePaidPlans.forEach((plan, index) => {
    const isEnterprise = plan.price === null || plan.price === undefined; // Nếu có gói liên hệ
    displayPlans.push({
      ...plan,
      mappedFeatures: mapFeatures(plan),
      cta: isEnterprise ? "Liên Hệ Tư Vấn" : "Nâng Cấp Ngay",
      ctaStyle: isEnterprise 
        ? "border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold hover:bg-sky-50"
        : "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-lg shadow-sky-100",
      popular: index === 0 // Đánh dấu gói đầu tiên là popular
    });
  });

  const handlePurchase = async (packageId) => {
    setLoadingPayment(true);
    try {
      const response = await paymentApi.createVnpayUrl({
        packageId
      });

      if (response?.success && response?.paymentUrl) {
        window.location.assign(response.paymentUrl);
      } else {
        showToast({
          message: response?.message || "Không thể tạo liên kết thanh toán.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Lỗi khởi tạo thanh toán VNPAY:", error);
      showToast({
        message: error.response?.data?.message || "Có lỗi xảy ra khi kết nối cổng thanh toán.",
        type: "error"
      });
    } finally {
      setLoadingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Lỗi tải dữ liệu gói thanh toán. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Chọn Gói Phù Hợp Với Bạn</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nâng cấp để mở khóa tất cả tính năng ưu việt và tối ưu hiệu quả công việc.
          </p>

          {/* Chỉ hiển thị toggle tháng/năm nếu có gói năm */}
          {yearlyPlans.length > 0 && (
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
                  Tiết Kiệm
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20 justify-center">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 relative transition-all duration-300 w-full max-w-sm mx-auto ${
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
                  {!plan.price || plan.price === "0.00" || plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">
                      Miễn Phí
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {Number(plan.price).toLocaleString("vi-VN")}
                      </span>
                      <span className="text-gray-500 font-medium">đ/ {plan.duration_days === 365 ? "năm" : "tháng"}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.mappedFeatures.map((feature, index) => (
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
                    <span className={`text-sm ${feature.included ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={plan.price === 0 || plan.price === "0.00" || loadingPayment}
                className={`w-full py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${plan.ctaStyle}`}
              >
                {loadingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>{plan.cta}</span>
                )}
              </button>
            </div>
          ))}
        </div>

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
