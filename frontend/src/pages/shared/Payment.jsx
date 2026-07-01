import { Check, X, ChevronDown, Loader2, Coins, Sparkles, BriefcaseBusiness, Bot, FileSearch } from "lucide-react";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { useQuery } from "@tanstack/react-query";
import paymentApi from "../../api/paymentApi";
import { useUiStore } from "../../store/useUiStore";

// Credit cost constants (phải đồng bộ với backend CREDIT_COSTS)
const CREDIT_COSTS = {
  JOB_POST: 10,
  AI_SCREENING: 30,
  AI_INTERVIEW: 10,
};

const candidateFaqs = [
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

const hrFaqs = [
  {
    question: "Credit hoạt động như thế nào?",
    answer: "Credit là đơn vị tiền tệ ảo trên MockAI. Bạn nạp credit một lần, dùng dần cho các hành động (đăng tin, lọc AI, phỏng vấn AI). Không bị ép đóng phí hàng tháng.",
  },
  {
    question: "Credit có hết hạn không?",
    answer: "Credit có hạn sử dụng tùy gói (thường 365 ngày). Gói Starter miễn phí có HSD 30 ngày.",
  },
  {
    question: "Gói Công ty (Enterprise) khác gì?",
    answer: "Gói Enterprise nạp credit vào ví chung của công ty. Tất cả HR trong công ty dùng chung pool credit này. Khi hết, mỗi HR vẫn có thể dùng ví cá nhân của mình. Liên hệ để thương lượng số lượng và giá.",
  },
  {
    question: "Các phương thức thanh toán được hỗ trợ?",
    answer: "Chúng tôi hỗ trợ thanh toán qua VNPay, thẻ tín dụng/ghi nợ (Visa, Mastercard), Momo, và chuyển khoản ngân hàng.",
  },
];

const mapCandidateFeatures = (pkg) => {
  const features = [];
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
  return features;
};

/** Credit cost pricing table component for HR */
const CreditCostTable = () => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-lg p-8 mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center">
        <Coins className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bảng giá hành động</h2>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-5 text-center border border-sky-100 dark:border-sky-800/30">
        <BriefcaseBusiness className="w-7 h-7 text-[#0ea5e9] mx-auto mb-3" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{CREDIT_COSTS.JOB_POST} <span className="text-sm font-medium text-gray-500">credit</span></p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Đăng 1 tin tuyển dụng</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Hiển thị 14 ngày</p>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 text-center border border-amber-100 dark:border-amber-800/30">
        <FileSearch className="w-7 h-7 text-amber-500 mx-auto mb-3" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">+{CREDIT_COSTS.AI_SCREENING} <span className="text-sm font-medium text-gray-500">credit</span></p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bật Lọc AI cho tin</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">AI sàng lọc ứng viên tự động</p>
      </div>
      <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-5 text-center border border-violet-100 dark:border-violet-800/30">
        <Bot className="w-7 h-7 text-violet-500 mx-auto mb-3" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{CREDIT_COSTS.AI_INTERVIEW} <span className="text-sm font-medium text-gray-500">credit</span></p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Phỏng vấn AI / ứng viên</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">AI phỏng vấn + đánh giá</p>
      </div>
    </div>
  </div>
);

/** Calculate savings percentage */
const calcSavings = (price, credits, basePricePerCredit) => {
  if (!price || price <= 0 || !credits) return 0;
  const currentPpc = price / credits;
  return Math.round((1 - currentPpc / basePricePerCredit) * 100);
};

export function Payment() {
  const { showToast } = useUiStore();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await paymentApi.getPackages();
      return response.data;
    }
  });

  const packages = data || [];
  const isHr = packages.some(p => p.target_role === "HR");
  const faqs = isHr ? hrFaqs : candidateFaqs;

  // ─── CANDIDATE LOGIC ───
  const freePlan = packages.find(p => p.price === "0.00" || p.price === 0);
  const paidPlans = packages.filter(p => p.price !== "0.00" && Number(p.price) > 0);
  const monthlyPlans = paidPlans.filter(p => p.duration_days === 30);
  const yearlyPlans = paidPlans.filter(p => p.duration_days === 365);

  // ─── HR CREDIT LOGIC ───
  const hrFreePlan = packages.find(p => p.target_role === "HR" && (p.price === "0.00" || p.price === 0));
  const hrPaidPlans = packages.filter(p => p.target_role === "HR" && Number(p.price) > 0);
  const hrEnterprisePlan = packages.find(p => p.target_role === "HR" && Number(p.price) < 0); // price = -1

  // Base price per credit (from cheapest paid plan)
  const basePpc = hrPaidPlans.length > 0
    ? Math.max(...hrPaidPlans.map(p => Number(p.price) / p.total_credits))
    : 0;

  // ─── BUILD DISPLAY PLANS ───
  let displayPlans = [];

  if (isHr) {
    // HR: Credit bundles
    if (hrFreePlan) {
      displayPlans.push({
        ...hrFreePlan,
        cta: "Gói Mặc Định",
        ctaStyle: "border-2 border-gray-100 dark:border-white/10 text-gray-400 cursor-not-allowed font-bold"
      });
    }
    hrPaidPlans.forEach((plan, index) => {
      const savings = calcSavings(Number(plan.price), plan.total_credits, basePpc);
      displayPlans.push({
        ...plan,
        savings,
        cta: "Nạp Credit",
        ctaStyle: "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-lg shadow-sky-100",
        popular: index === 1 // Pro = recommended
      });
    });
    if (hrEnterprisePlan) {
      displayPlans.push({
        ...hrEnterprisePlan,
        savings: 50,
        cta: "Liên Hệ Tư Vấn",
        ctaStyle: "border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold hover:bg-sky-50 dark:hover:bg-sky-900/20"
      });
    }
  } else {
    // Candidate: Subscription
    if (freePlan) {
      displayPlans.push({
        ...freePlan,
        mappedFeatures: mapCandidateFeatures(freePlan),
        cta: "Gói Hiện Tại",
        ctaStyle: "border-2 border-gray-100 dark:border-white/10 text-gray-400 cursor-not-allowed font-bold"
      });
    }
    const activePaidPlans = isYearly ? yearlyPlans : monthlyPlans;
    activePaidPlans.forEach((plan, index) => {
      displayPlans.push({
        ...plan,
        mappedFeatures: mapCandidateFeatures(plan),
        cta: "Nâng Cấp Ngay",
        ctaStyle: "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-lg shadow-sky-100",
        popular: index === 0
      });
    });
  }

  const handlePurchase = async (packageId) => {
    setLoadingPayment(true);
    try {
      const response = await paymentApi.createVnpayUrl({ packageId });
      if (response?.success && response?.paymentUrl) {
        window.location.assign(response.paymentUrl);
      } else {
        showToast({ message: response?.message || "Không thể tạo liên kết thanh toán.", type: "error" });
      }
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Có lỗi xảy ra khi kết nối cổng thanh toán.", type: "error" });
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
    <div className="dark:bg-transparent bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {isHr ? "Nạp Credit Tuyển Dụng" : "Chọn Gói Phù Hợp Với Bạn"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {isHr
              ? "Mua credit một lần, dùng dần. Không đóng phí hàng tháng."
              : "Nâng cấp để mở khóa tất cả tính năng ưu việt và tối ưu hiệu quả công việc."}
          </p>

          {/* Toggle tháng/năm chỉ cho Candidate */}
          {!isHr && yearlyPlans.length > 0 && (
            <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-800 rounded-full p-1.5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? "bg-[#0ea5e9] text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Hàng Tháng
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isYearly ? "bg-[#0ea5e9] text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Hàng Năm
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] uppercase">
                  Tiết Kiệm
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bảng giá hành động cho HR */}
        {isHr && <CreditCostTable />}

        {/* Pricing Cards */}
        <div className={`grid gap-8 mb-20 justify-center ${
          displayPlans.length <= 3 ? "md:grid-cols-3" : 
          displayPlans.length === 4 ? "md:grid-cols-4" : 
          "md:grid-cols-3 lg:grid-cols-5"
        }`}>
          {displayPlans.map((plan) => {
            const isEnterprise = Number(plan.price) < 0;
            const isFree = plan.price === 0 || plan.price === "0.00";
            const isPaid = !isFree && !isEnterprise;

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl p-8 relative transition-all duration-300 w-full max-w-sm mx-auto ${
                  plan.popular
                    ? "border-2 border-[#0ea5e9] shadow-2xl shadow-sky-900/20 scale-105 z-10"
                    : "border border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl dark:shadow-slate-900/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0ea5e9] text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Khuyên dùng
                  </div>
                )}
                {plan.savings > 0 && !plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Tiết kiệm {plan.savings}%
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  
                  {/* HR: Hiển thị số credit */}
                  {isHr && (
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-lg font-bold text-amber-500">{plan.total_credits?.toLocaleString("vi-VN")} Credit</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-center gap-1">
                    {isFree ? (
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">Miễn Phí</span>
                    ) : isEnterprise ? (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Liên Hệ</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {Number(plan.price).toLocaleString("vi-VN")}
                        </span>
                        {isHr ? (
                          <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">đ</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            đ/ {plan.duration_days === 365 ? "năm" : "tháng"}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* HR: Đơn giá per credit */}
                  {isHr && isPaid && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ~ {Math.round(Number(plan.price) / plan.total_credits).toLocaleString("vi-VN")}đ / credit
                    </p>
                  )}
                  
                  {/* HR: HSD */}
                  {isHr && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      HSD: {plan.credit_expiry_days || 365} ngày
                    </p>
                  )}
                </div>

                {/* Candidate: Feature list */}
                {!isHr && plan.mappedFeatures && (
                  <ul className="space-y-4 mb-10">
                    {plan.mappedFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* HR: Credit usage examples */}
                {isHr && !isEnterprise && (
                  <div className="space-y-2 mb-8 text-xs text-gray-500 dark:text-gray-400">
                    <p>≈ {Math.floor(plan.total_credits / CREDIT_COSTS.JOB_POST)} tin thường</p>
                    <p>≈ {Math.floor(plan.total_credits / (CREDIT_COSTS.JOB_POST + CREDIT_COSTS.AI_SCREENING))} tin có lọc AI</p>
                    <p>≈ {Math.floor(plan.total_credits / CREDIT_COSTS.AI_INTERVIEW)} lượt phỏng vấn AI</p>
                  </div>
                )}

                {/* HR Enterprise: Special description */}
                {isHr && isEnterprise && (
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0ea5e9] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Credit chia sẻ cho toàn bộ HR trong công ty</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0ea5e9] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Thương lượng số lượng credit & giá</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0ea5e9] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hỗ trợ kỹ thuật ưu tiên</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isFree || loadingPayment}
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
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8 uppercase tracking-widest">Hỗ trợ giải đáp</h2>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-all group outline-none">
                  <span className="font-bold text-left text-gray-700 dark:text-gray-300 group-data-[state=open]:text-[#0ea5e9] transition-colors">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#0ea5e9] transition-all" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-in slide-in-from-top-2">
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
