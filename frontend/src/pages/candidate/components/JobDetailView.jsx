import { Bookmark, MapPin, DollarSign, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * JobDetailView Component
 * Renders detailed description and metadata of a selected job listing
 */
export function JobDetailView({ job, onToggleBookmark, isBookmarked }) {
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
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.01]">
            Nộp Đơn Ngay
          </button>
          <button 
            onClick={() => onToggleBookmark(job.id)}
            className="px-4 py-3 border-2 dark:border-white/10 border-gray-200 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 hover:bg-[#f0f9ff] dark:text-slate-400 text-gray-400 hover:text-[#0ea5e9] transition-all"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#0ea5e9] text-[#0ea5e9]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main details body */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Thông Tin Chung</h3>
          <div className="grid grid-cols-2 gap-4 dark:bg-slate-800/50 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-100">
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Mức lương</p>
              <p className="font-bold text-[#0ea5e9]">{job.salary}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Kinh nghiệm</p>
              <p className="font-bold dark:text-white text-gray-800">{job.experience}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Hình thức</p>
              <p className="font-bold dark:text-white text-gray-800">{job.type}</p>
            </div>
            <div>
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">Địa điểm</p>
              <p className="font-bold dark:text-white text-gray-800">{job.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Mô Tả Công Việc</h3>
          <div className="dark:text-slate-300 text-gray-700 text-sm leading-relaxed space-y-3">
            <p>
              Chúng tôi đang tìm kiếm một {job.title} để gia nhập đội ngũ phát triển
              sản phẩm. Bạn sẽ làm việc với các công nghệ hiện đại và tham gia vào các dự án
              thú vị của chúng tôi.
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Phát triển và duy trì các tính năng mới trên các sản phẩm cốt lõi.</li>
              <li>Làm việc chặt chẽ với team thiết kế và backend để đảm bảo chất lượng.</li>
              <li>Tham gia code review và liên tục cập nhật/áp dụng các tiêu chuẩn chất lượng.</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Yêu Cầu Công Việc</h3>
          <ul className="list-disc list-inside space-y-1.5 dark:text-slate-300 text-gray-700 text-sm ml-2">
            <li>Kinh nghiệm làm việc từ {job.experience}.</li>
            <li>Thành thạo các công nghệ chính: {job.tags.join(", ")}.</li>
            <li>Kỹ năng giao tiếp tốt, tư duy phản biện.</li>
            <li>Tinh thần trách nhiệm và khả năng phối hợp đội nhóm tốt.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3 uppercase text-xs tracking-wider dark:text-slate-400 text-gray-400">Phúc Lợi</h3>
          <ul className="list-disc list-inside space-y-1.5 dark:text-slate-300 text-gray-700 text-sm ml-2">
            <li>Lương thưởng cạnh tranh dựa trên năng lực cá nhân.</li>
            <li>Đóng bảo hiểm đầy đủ (BHXH, BHYT) theo quy định của nhà nước.</li>
            <li>Chính sách làm việc linh hoạt, có hỗ trợ thiết bị.</li>
            <li>Môi trường năng động, chuyên nghiệp và có cơ hội thăng tiến cao.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
