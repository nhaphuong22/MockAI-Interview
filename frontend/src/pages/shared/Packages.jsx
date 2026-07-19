import { Check, X, ChevronDown, Loader2, Coins, Sparkles, BriefcaseBusiness, Bot, FileSearch, Crown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 text-sm text-gray-700 dark:text-gray-300 border border-white/40 dark:border-sky-500/20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-full py-4 px-8 shadow-xl dark:shadow-[0_0_30px_rgba(14,165,233,0.1)] mx-auto max-w-fit relative overflow-hidden"
  >
    {/* Subtle shimmer effect inside */}
    <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 dark:via-sky-400/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>

    <div className="flex items-center gap-2 group z-10">
      <div className="p-2 bg-sky-100 dark:bg-sky-900/40 rounded-full group-hover:scale-110 transition-transform">
        <BriefcaseBusiness className="w-4 h-4 text-[#0ea5e9]" />
      </div>
      <span><strong className="text-gray-900 dark:text-white">{CREDIT_COSTS.JOB_POST} credit</strong> / tin thường</span>
    </div>
    <div className="hidden sm:block w-1 h-1 rounded-full bg-sky-300 dark:bg-sky-700/50 z-10"></div>
    <div className="flex items-center gap-2 group z-10">
      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-full group-hover:scale-110 transition-transform">
        <FileSearch className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
      </div>
      <span><strong className="text-gray-900 dark:text-white">+{CREDIT_COSTS.AI_SCREENING} credit</strong> / Lọc AI</span>
    </div>
    <div className="hidden sm:block w-1 h-1 rounded-full bg-sky-300 dark:bg-sky-700/50 z-10"></div>
    <div className="flex items-center gap-2 group z-10">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full group-hover:scale-110 transition-transform">
        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <span><strong className="text-gray-900 dark:text-white">{CREDIT_COSTS.AI_INTERVIEW} credit</strong> / Phỏng vấn AI</span>
    </div>
  </motion.div>
);

/** Calculate savings percentage */
const calcSavings = (price, credits, basePricePerCredit) => {
  if (!price || price <= 0 || !credits) return 0;
  const currentPpc = price / credits;
  return Math.round((1 - currentPpc / basePricePerCredit) * 100);
};

export function Packages() {
  const { showToast } = useUiStore();
  const navigate = useNavigate();
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
        cta: index === 1 ? "Nạp Credit Ngay" : "Nạp Credit",
        ctaStyle: index === 1
          ? "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-md shadow-cyan-200 dark:shadow-none transform hover:-translate-y-0.5"
          : "text-[#0ea5e9] border border-[#0ea5e9] hover:bg-cyan-50 dark:hover:bg-slate-700 font-semibold",
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
        cta: index === 0 ? "Nâng Cấp Ngay" : "Nâng Cấp",
        ctaStyle: index === 0
          ? "bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] shadow-md shadow-cyan-200 dark:shadow-none transform hover:-translate-y-0.5"
          : "text-[#0ea5e9] border border-[#0ea5e9] hover:bg-cyan-50 dark:hover:bg-slate-700 font-semibold",
        popular: index === 0
      });
    });
  }

  const handlePurchase = (packageId) => {
    // Navigate to checkout page instead of generating URL directly
    if (isHr) {
      navigate(`/hr/dashboard/checkout/${packageId}`);
    } else {
      navigate(`/checkout/${packageId}`);
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
    <div className="relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] pb-12 min-h-screen">
      {/* Decorative Premium Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/40 via-slate-50 to-slate-50 dark:from-sky-900/20 dark:via-[#0B1120] dark:to-[#0B1120] -z-10"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-300/20 dark:bg-sky-800/20 blur-[100px] -z-10 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] rounded-full bg-cyan-300/20 dark:bg-cyan-900/20 blur-[80px] -z-10 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-300 mb-4 tracking-tight">
            {isHr ? "Nạp Credit Tuyển Dụng" : "Chọn Gói Phù Hợp Với Bạn"}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-slate-400 mb-5 max-w-2xl mx-auto font-medium">
            {isHr
              ? "Mua credit một lần, dùng dần. Không đóng phí hàng tháng."
              : "Nâng cấp để mở khóa tất cả tính năng ưu việt và tối ưu hiệu quả công việc."}
          </p>

          {/* Toggle tháng/năm chỉ cho Candidate */}
          {!isHr && yearlyPlans.length > 0 && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full p-1.5 border border-white/40 dark:border-slate-700 shadow-lg"
            >
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!isYearly ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-200 dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Hàng Tháng
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isYearly ? "bg-[#0ea5e9] text-white shadow-md shadow-sky-200 dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Hàng Năm
                <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-[10px] uppercase font-black tracking-wider shadow-sm">
                  Tiết Kiệm
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Bảng giá hành động cho HR */}
        {isHr && <CreditCostTable />}

        {/* Pricing Cards */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="flex flex-wrap justify-center items-stretch gap-8 mb-10 max-w-6xl mx-auto"
        >
          {displayPlans.map((plan) => {
            const isEnterprise = Number(plan.price) < 0;
            const isFree = plan.price === 0 || plan.price === "0.00";
            const isPaid = !isFree && !isEnterprise;
            const isBusiness = plan.name === "BUSINESS";

            return (
              <motion.div
                key={plan.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className={`rounded-3xl p-6 relative transition-all duration-300 w-full max-w-[340px] flex flex-col group ${
                  plan.popular
                    ? "border border-sky-400/50 dark:border-sky-500/50 shadow-2xl dark:shadow-[0_10px_40px_-10px_rgba(14,165,233,0.3)] lg:-translate-y-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
                    : isBusiness
                    ? "border-[3px] border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] bg-gradient-to-b from-cyan-50/80 to-white dark:from-slate-900 dark:to-cyan-950/40 lg:-translate-y-3 z-10 backdrop-blur-xl"
                    : "border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl dark:shadow-slate-900/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:-translate-y-1"
                }`}
              >
                {/* Subtle top glow for PRO plan */}
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent"></div>
                )}

                {/* Business plan top highlight */}
                {isBusiness && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                )}

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-[#0ea5e9] to-cyan-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Khuyên dùng
                  </div>
                )}
                {plan.savings > 0 && !plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Tiết kiệm {plan.savings}%
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`font-bold mb-1 ${
                    isBusiness 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-400 drop-shadow-sm text-2xl tracking-widest font-black uppercase"
                      : "text-xl text-gray-900 dark:text-white"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  {/* HR: Hiển thị số credit */}
                  {isHr && (
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-bold text-slate-800 dark:text-white">{plan.total_credits?.toLocaleString("vi-VN")} Credit</span>
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
                  
                </div>

                {/* Candidate: Feature list */}
                {!isHr && plan.mappedFeatures && (
                  <ul className="space-y-3 mb-6">
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
                  <div className={`space-y-2 text-xs text-gray-500 dark:text-gray-400 ${isBusiness ? 'mb-4' : 'mb-8'}`}>
                    <p>≈ {Math.floor(plan.total_credits / CREDIT_COSTS.JOB_POST)} tin thường</p>
                    <p>≈ {Math.floor(plan.total_credits / (CREDIT_COSTS.JOB_POST + CREDIT_COSTS.AI_SCREENING))} tin có lọc AI</p>
                    <p>≈ {Math.floor(plan.total_credits / CREDIT_COSTS.AI_INTERVIEW)} lượt phỏng vấn AI</p>
                  </div>
                )}

                {/* HR Business: Special perks Preview */}
                {isHr && isBusiness && (
                  <div className="mb-6 relative rounded-2xl bg-[#0f172a] overflow-hidden border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] p-4 group/demo">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] uppercase font-black text-cyan-400 tracking-widest drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]">
                          Demo Hiển Thị Thực Tế
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      </div>
                      
                      {/* Live Demo Mockup */}
                      <div className="flex items-center gap-3.5 bg-slate-800/80 rounded-xl p-3 border border-cyan-900/50 shadow-inner">
                        {/* Glowing Logo */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-cyan-400 rounded-lg blur-[8px] opacity-70 group-hover/demo:opacity-100 group-hover/demo:blur-[12px] animate-pulse transition-all duration-500"></div>
                          <div className="relative w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-md border border-cyan-200">
                             <BriefcaseBusiness className="w-6 h-6 text-cyan-600" />
                          </div>
                        </div>
                        
                        {/* Glowing Name */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,1)] truncate">
                            TECH NOVA CO.
                          </span>
                          <span className="text-[10px] flex items-center gap-1 mt-0.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]" /> 
                            <span className="text-amber-400 font-bold uppercase tracking-wide truncate">Nhà Tuyển Dụng VIP</span>
                          </span>
                        </div>
                      </div>
                    </div>
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

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isFree || loadingPayment}
                    className={`w-full py-3 rounded-xl transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${plan.ctaStyle}`}
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
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-300 mb-8 uppercase tracking-widest">Hỗ trợ giải đáp</h2>
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
