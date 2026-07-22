import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import {
  Sparkles, Users, UserCheck, UserX, Clock, Loader2,
  ShieldAlert, TrendingUp, AlertTriangle, Lightbulb,
  Trophy, ArrowDown, ChevronRight, Zap, Target,
  RefreshCw
} from "lucide-react";

/**
 * CampaignAIReport - Premium AI-powered recruitment campaign report
 * Layout: Funnel Overview -> Bottleneck Analysis -> Top Candidates -> AI Action Items
 */
export function CampaignAIReport({ jobId }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["campaign-ai-report", jobId],
    queryFn: async () => {
      const response = await jobApi.getJobCampaignReport(jobId);
      return response.data;
    },
    enabled: !!jobId,
    retry: false
  });

  // --- Loading State ---
  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/40 to-blue-50/40 animate-pulse" />
        <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin mb-6 relative z-10" />
        <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Hệ thống AI đang phân tích dữ liệu...</h3>
        <p className="text-gray-500 text-sm relative z-10">Quá trình này có thể mất từ 5 - 15 giây tùy vào số lượng ứng viên.</p>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-rose-600 font-bold mb-2 text-lg">Không thể sinh báo cáo!</p>
        <p className="text-gray-500 mb-6 max-w-md text-sm">{error?.response?.data?.message || "Lỗi hệ thống khi gọi AI Phân Tích."}</p>
        <button onClick={() => refetch()} className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold transition-colors">
          Thử lại
        </button>
      </div>
    );
  }

  const report = data;
  const funnel = report?.funnel;
  const bottlenecks = report?.bottlenecks;
  const topCandidates = report?.top_candidates;
  const actionItems = report?.action_items;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Cache Banner */}
      {report?.is_cached && report?.generated_at && (
        <div className="flex items-center justify-between bg-sky-50/60 border border-sky-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
            </div>
            <div>
              <p className="text-sm font-bold text-sky-900">Đã tải báo cáo từ bộ nhớ đệm (Cache)</p>
              <p className="text-xs text-sky-700">Dữ liệu được tạo vào lúc {new Date(report.generated_at).toLocaleString("vi-VN")} và chưa có sự thay đổi mới nào từ ứng viên.</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#0ea5e9] text-sm font-bold rounded-xl border border-sky-200 shadow-sm hover:bg-sky-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      )}

      {/* =====================================================
          SECTION 1: PHỄU TUYỂN DỤNG (Recruitment Funnel)
         ===================================================== */}
      {funnel && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Tổng Quan Phễu Tuyển Dụng</h3>
              <p className="text-xs text-gray-500 font-medium">Recruitment Funnel Overview</p>
            </div>
          </div>

          {/* Funnel Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
            <FunnelCard
              icon={<Users className="w-4 h-4 text-sky-600" />}
              bgIcon="bg-sky-100"
              label="Tổng CV"
              value={funnel.total_cvs}
              sub="ứng viên"
            />
            <FunnelCard
              icon={<UserCheck className="w-4 h-4 text-teal-600" />}
              bgIcon="bg-teal-100"
              label="Qua Lọc CV"
              value={funnel.cv_passed}
              sub={`${funnel.cv_pass_rate || 0}%`}
              subColor="text-teal-600"
            />
            <FunnelCard
              icon={<Target className="w-4 h-4 text-indigo-600" />}
              bgIcon="bg-indigo-100"
              label="Hoàn Thành PV AI"
              value={funnel.ai_interview_completed}
              sub="phỏng vấn"
            />
            <FunnelCard
              icon={<UserCheck className="w-4 h-4 text-emerald-600" />}
              bgIcon="bg-emerald-100"
              label="Đậu PV AI"
              value={funnel.ai_interview_passed}
              sub={`${funnel.ai_interview_pass_rate || 0}%`}
              subColor="text-emerald-600"
            />
            <FunnelCard
              icon={<UserX className="w-4 h-4 text-rose-600" />}
              bgIcon="bg-rose-100"
              label="Rớt PV AI"
              value={funnel.ai_interview_failed}
              sub="ứng viên"
              subColor="text-rose-500"
            />
            <FunnelCard
              icon={<Clock className="w-4 h-4 text-amber-600" />}
              bgIcon="bg-amber-100"
              label="Tốc Độ TB"
              value={`${funnel.avg_time_days}`}
              sub="ngày"
              subColor="text-amber-600"
            />
          </div>

          {/* Conversion Rate Bar */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1">Tỷ Lệ Chuyển Đổi Chung (CV → Đậu PV AI)</p>
              <p className="text-4xl font-black">{funnel.overall_conversion_rate || 0}<span className="text-xl">%</span></p>
            </div>
            <div className="relative z-10 flex-1 max-w-md w-full">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(funnel.overall_conversion_rate || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                <span>{funnel.total_cvs} CV nộp</span>
                <span>{funnel.ai_interview_passed} đậu</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          SECTION 2: PHÂN TÍCH ĐIỂM NGHẼN (Bottleneck Analysis)
         ===================================================== */}
      {bottlenecks && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Phân Tích Điểm Nghẽn & Lý Do Rớt</h3>
              <p className="text-xs text-gray-500 font-medium">Bottleneck & Rejection Analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CV Stage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-amber-600" />
                <h4 className="font-black text-amber-800 text-sm">Vòng Lọc CV (CV Screening)</h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed">{bottlenecks.cv_stage}</p>
              </div>
            </div>

            {/* AI Interview Stage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-rose-50 border-b border-rose-100 px-5 py-3 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-rose-600" />
                <h4 className="font-black text-rose-800 text-sm">Vòng Phỏng Vấn AI (AI Interview)</h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed">{bottlenecks.ai_stage}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          SECTION 3: TOP ỨNG VIÊN XUẤT SẮC (Top Candidates)
         ===================================================== */}
      {topCandidates && topCandidates.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Top Ứng Viên Xuất Sắc</h3>
              <p className="text-xs text-gray-500 font-medium">Cần phỏng vấn vòng tiếp theo / Gửi Offer</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Hạng</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                    <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm PV AI</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Kỹ Năng Nổi Bật</th>
                    <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topCandidates.map((candidate, index) => (
                    <tr key={candidate.id || index} className="hover:bg-sky-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <RankBadge rank={index + 1} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 text-sm">{candidate.name}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-black ${
                          candidate.score >= 80
                            ? "bg-emerald-100 text-emerald-700"
                            : candidate.score >= 60
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {candidate.score}/100
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600 font-medium">{candidate.key_strengths}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {candidate.status || "Đã Đậu"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          SECTION 4: ĐỀ XUẤT HÀNH ĐỘNG TỪ AI (AI Action Items)
         ===================================================== */}
      {actionItems && actionItems.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Đề Xuất Hành Động Từ AI</h3>
              <p className="text-xs text-gray-500 font-medium">AI Actionable Insights</p>
            </div>
          </div>

          <div className="space-y-4">
            {actionItems.map((item, index) => (
              <ActionItemCard key={index} item={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────

/**
 * FunnelCard - A single metric card in the funnel overview
 */
function FunnelCard({ icon, bgIcon, label, value, sub, subColor = "text-gray-400" }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${bgIcon} flex items-center justify-center`}>
          {icon}
        </div>
        <p className="text-xs font-bold text-gray-500 leading-tight">{label}</p>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className={`text-xs font-bold ${subColor} mt-0.5`}>{sub}</p>
    </div>
  );
}

/**
 * RankBadge - Shows rank with gold/silver/bronze styling for top 3
 */
function RankBadge({ rank }) {
  const styles = {
    1: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-200",
    2: "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200",
    3: "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-300",
  };

  const style = styles[rank] || "bg-gray-100 text-gray-600";

  return (
    <div className={`w-8 h-8 rounded-lg ${style} flex items-center justify-center font-black text-sm shadow-sm`}>
      {rank}
    </div>
  );
}

/**
 * ActionItemCard - A single AI recommendation card
 */
function ActionItemCard({ item }) {
  // Determine icon and color based on action type
  const typeConfig = getActionTypeConfig(item.type);

  return (
    <div className={`bg-white rounded-2xl border ${typeConfig.borderColor} shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-4 p-5">
        <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
          {typeConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${typeConfig.badgeBg} ${typeConfig.badgeText}`}>
              {typeConfig.emoji} {item.type}
            </span>
          </div>
          {item.title && (
            <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
          )}
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
      </div>
    </div>
  );
}

/**
 * Returns visual config based on action item type string
 */
function getActionTypeConfig(type) {
  const lowerType = (type || "").toLowerCase();

  if (lowerType.includes("sửa") || lowerType.includes("chỉnh") || lowerType.includes("cần")) {
    return {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-100",
      borderColor: "border-amber-100",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-700",
      emoji: "⚠️"
    };
  }

  if (lowerType.includes("nhanh") || lowerType.includes("hành động") || lowerType.includes("đẩy")) {
    return {
      icon: <Zap className="w-5 h-5 text-[#0ea5e9]" />,
      bgColor: "bg-sky-100",
      borderColor: "border-sky-100",
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-700",
      emoji: "⚡"
    };
  }

  if (lowerType.includes("cảnh báo") || lowerType.includes("nguy")) {
    return {
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      bgColor: "bg-rose-100",
      borderColor: "border-rose-100",
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-700",
      emoji: "🚨"
    };
  }

  // Default
  return {
    icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-100",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    emoji: "💡"
  };
}
