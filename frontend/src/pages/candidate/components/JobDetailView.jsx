
import { Bookmark, MapPin, DollarSign, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark, MapPin, DollarSign, Briefcase, Clock,
  Users, ChevronRight, Share2, Building2, Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const TABS = [
  { id: "description", label: "Mô tả công việc" },
  { id: "requirements", label: "Yêu cầu" },
  { id: "benefits", label: "Quyền lợi" },
  { id: "company", label: "Giới thiệu công ty" },
];


/**
 * JobDetailView - Tab-based detail panel matching reference design
 */
export function JobDetailView({ job, onToggleBookmark, isBookmarked }) {
  const [activeTab, setActiveTab] = useState("description");
  const contentRef = useRef(null);

  useEffect(() => {
    setActiveTab("description");
    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [job.id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [activeTab]);

  const companyInitial =
    typeof job.logo === "string" && job.logo.length <= 2
      ? job.logo
      : (job.company || "?").charAt(0).toUpperCase();

  return (

    <div className="w-1/2 border-l dark:border-white/10 border-gray-200 dark:bg-[#0a0f1c]/80 bg-white overflow-y-auto h-full flex flex-col">
      {/* Sticky top actions bar */}
      <div className="sticky top-0 dark:bg-[#0a0f1c]/95 bg-white/95 backdrop-blur-md border-b dark:border-white/10 border-gray-200 p-6 z-10">
        <div className="flex items-start gap-4 mb-4">
          {job.company_id ? (
            <Link
              to={`/companies/${job.company_id}`}
              className="w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-3xl shrink-0 text-white hover:opacity-90 transition-opacity"
            >
              {job.logo}
            </Link>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-3xl shrink-0 text-white">
              {job.logo}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-1 truncate">{job.title}</h2>
            {job.company_id ? (
              <Link
                to={`/companies/${job.company_id}`}
                className="text-lg dark:text-slate-300 text-gray-600 font-medium hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] transition-colors inline-block"
              >
                {job.company}
              </Link>
            ) : (
              <p className="text-lg dark:text-slate-300 text-gray-600 font-medium">{job.company}</p>
            )}

    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/70 dark:border-white/5 dark:bg-slate-900/80 dark:shadow-none h-full flex flex-col">

      {/* ── HEADER ── */}
      <div className="px-5 py-4 border-b dark:border-white/5 border-slate-100 bg-white dark:bg-slate-900/80">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-sky-100 dark:shadow-sky-900/20 shrink-0">
            {companyInitial}
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-gray-950 dark:text-white leading-tight mb-1">
              {job.title}
            </h2>
            <p className="text-[#0ea5e9] font-semibold text-sm mb-1.5">{job.company}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
              {job.posted && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Hết hạn trong 15 ngày
                </span>
              )}
              {job.applicants > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {job.applicants} ứng viên đã nộp
                </span>
              )}
            </div>
          </div>

          {/* CTA column */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/jobs/${job.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-lg text-sm hover:shadow-lg hover:shadow-sky-200/60 dark:hover:shadow-[#0ea5e9]/20 transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              Ứng Tuyển Ngay
            </Link>
            <button
              onClick={() => onToggleBookmark(job.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold border transition-all ${isBookmarked
                  ? "border-[#0ea5e9] text-[#0ea5e9] bg-sky-50 dark:bg-[#0ea5e9]/10"
                  : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:border-[#0ea5e9]/50 hover:text-[#0ea5e9]"
                }`}
              title={isBookmarked ? "Đã lưu" : "Lưu tin"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-[#0ea5e9]/50 hover:text-[#0ea5e9] dark:border-white/10 dark:text-slate-500"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* ── COMPACT META ── */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="grid grid-cols-4 gap-2">
          <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase text-slate-400">Mức lương</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm font-extrabold text-[#0ea5e9]">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.salary}</span>
            </p>
          </div>
          <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase text-slate-400">Kinh nghiệm</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{job.experience || "Không yêu cầu"}</span>
            </p>
          </div>
          <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase text-slate-400">Hình thức</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-800 dark:text-slate-200">{job.type || "Toàn thời gian"}</p>
          </div>
          <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase text-slate-400">Địa điểm</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{job.location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="px-5 border-b dark:border-white/5 border-slate-200 flex-shrink-0 bg-white dark:bg-slate-900/80">
        <nav className="flex gap-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "text-[#0ea5e9]"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB CONTENT ── */}
      <div
        ref={contentRef}
        className="job-detail-scroll flex-1 px-6 py-5 text-sm text-gray-700 dark:text-slate-300 leading-relaxed overflow-y-auto overscroll-contain scroll-smooth"
      >
        {activeTab === "description" && (
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Mô tả công việc</h3>
            {job.description ? (
              <div className="whitespace-pre-line space-y-3">{job.description}</div>
            ) : (
              <div className="space-y-3">
                <p>Chúng tôi đang tìm kiếm một <strong className="text-gray-900 dark:text-white">{job.title}</strong> tài năng để gia nhập đội ngũ phát triển sản phẩm.</p>
                <ul className="space-y-2 ml-1">
                  {[
                    "Thiết kế và triển khai các UI components có khả năng tái sử dụng cao.",
                    "Phối hợp với UX/UI designers để chuyển đổi các thiết kế phức tạp thành code chất lượng cao.",
                    "Tối ưu hóa các ứng dụng để đạt tốc độ và khả năng mở rộng tối đa.",
                    "Viết unit tests và đảm bảo chất lượng code thông qua quy trình code review.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-[#0ea5e9] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "requirements" && (
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Yêu cầu ứng viên</h3>
            {job.requirements ? (
              <div className="whitespace-pre-line space-y-2">{job.requirements}</div>
            ) : (
              <ul className="space-y-2.5 ml-1">
                {[
                  `Tối thiểu ${job.experience || "1-2 năm"} kinh nghiệm trong lĩnh vực liên quan.`,
                  job.tags?.length ? `Thành thạo: ${job.tags.join(", ")}.` : "Có kinh nghiệm với các công nghệ phổ biến.",
                  "Có khả năng đọc hiểu tài liệu kỹ thuật bằng tiếng Anh.",
                  "Kỹ năng giao tiếp tốt, có tinh thần làm việc nhóm.",
                  "Tư duy logic và khả năng giải quyết vấn đề tốt.",
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-[#0ea5e9]/10 border border-sky-100 dark:border-[#0ea5e9]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-[#0ea5e9]" />
                    </div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Skill tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2.5">Kỹ năng yêu cầu</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-sky-50 dark:bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-semibold rounded-lg border border-sky-100 dark:border-[#0ea5e9]/15">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "benefits" && (
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Quyền lợi được hưởng</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { emoji: "💰", title: "Lương thưởng hấp dẫn", desc: "Mức lương cạnh tranh, xét duyệt 6 tháng/lần dựa trên năng lực." },
                { emoji: "🏥", title: "Bảo hiểm đầy đủ", desc: "Đóng BHXH, BHYT, BHTN đầy đủ theo quy định nhà nước." },
                { emoji: "🏖️", title: "Nghỉ phép linh hoạt", desc: "12 ngày phép/năm + các ngày lễ theo quy định." },
                { emoji: "💻", title: "Thiết bị làm việc", desc: "Hỗ trợ Macbook hoặc laptop theo yêu cầu công việc." },
                { emoji: "📈", title: "Cơ hội phát triển", desc: "Lộ trình thăng tiến rõ ràng, hỗ trợ học tập và phát triển kỹ năng." },
              ].map(({ emoji, title, desc }, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                  <span className="text-xl shrink-0">{emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-slate-200 text-sm mb-0.5">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                {companyInitial}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{job.company}</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Doanh nghiệp tuyển dụng
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              {job.company} là một trong những công ty hàng đầu trong lĩnh vực của mình,
              cung cấp môi trường làm việc năng động và chuyên nghiệp.
              Chúng tôi luôn coi con người là tài sản quý giá nhất và không ngừng
              đầu tư vào việc phát triển đội ngũ nhân sự chất lượng cao.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 pb-4">
          <Link
            to={`/jobs/${job.id}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-sky-200/60 dark:hover:shadow-[#0ea5e9]/20 transition-all text-sm"
          >
            Xem chi tiết & Ứng tuyển
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
