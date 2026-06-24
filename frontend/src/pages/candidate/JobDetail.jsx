import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, DollarSign, Briefcase, Clock, Building, Users, Award, ChevronRight, Bookmark, Share2, Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import { jobApi } from "../../api/jobApi";

export function JobDetail() {
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. Gọi API lấy chi tiết Job thực tế
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["job-detail", id],
    queryFn: async () => {
      const res = await jobApi.getJobById(id);
      return res; // Axios interceptor đã bóc tách response.data
    },
    enabled: !!id
  });

  const job = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Đang tải thông tin chi tiết công việc...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <p className="text-red-500 font-bold mb-4">Không tìm thấy thông tin tin tuyển dụng này!</p>
        <Link to="/jobs" className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm shadow-md">
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  // Định dạng hiển thị mức lương
  const formatSalary = (min, max, currency, visible) => {
    if (!visible) return "Thương lượng (Ẩn)";
    if (!min && !max) return "Thương lượng";
    
    const formatNumber = (num) => {
      if (!num) return "";
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} Triệu`;
      return num.toLocaleString("vi-VN");
    };

    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    if (min) return `Từ ${formatNumber(min)} ${currency}`;
    return `Lên đến ${formatNumber(max)} ${currency}`;
  };

  const companyLogo = job.company_logo || job.company_name?.substring(0, 1).toUpperCase() || "J";

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/jobs" className="flex items-center gap-2 text-gray-600 hover:text-[#0ea5e9] transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Thẻ Công Việc */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-6 mb-6">
                {job.company_id ? (
                  <Link to={`/companies/${job.company_id}`} className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0 hover:opacity-90 transition-opacity">
                    {companyLogo}
                  </Link>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                    {companyLogo}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-gray-700 mb-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    {job.company_id ? (
                      <Link to={`/companies/${job.company_id}`} className="font-bold text-gray-800 hover:text-[#0ea5e9] transition-colors">
                        {job.company_name || "Công ty chưa xác minh"}
                      </Link>
                    ) : (
                      <span className="font-bold text-gray-800">{job.company_name || "Công ty chưa xác minh"}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.company_address || "Việt Nam"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#0ea5e9] font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{job.experience_level || "Không yêu cầu"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  Nộp Đơn Ngay
                </button>
                <button className="flex-1 py-3 border-2 border-[#0ea5e9] text-[#0ea5e9] rounded-xl font-bold hover:bg-[#f0f9ff] transition-all">
                  Phỏng Vấn AI Trước
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all text-sm"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#0ea5e9] text-[#0ea5e9]" : ""}`} />
                  <span>{isBookmarked ? "Đã lưu" : "Lưu việc"}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all text-sm">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>

            {/* Mô tả Công Việc & Yêu Cầu */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô Tả Công Việc</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line mb-8">
                {job.description || "Chưa có mô tả chi tiết."}
              </div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu Cầu Chung (AI Context)</h2>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </div>
                </>
              )}
            </div>

            {/* Yêu cầu Chi Tiết Để AI Chấm Điểm */}
            {job.detailed_requirements && job.detailed_requirements.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Yêu Cầu Chi Tiết Để AI Chấm Điểm</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.detailed_requirements.map((req, idx) => (
                    <div
                      key={req.id || idx}
                      className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-sky-100 transition-colors"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${req.is_mandatory ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`} title={req.is_mandatory ? "Bắt buộc" : "Tùy chọn"}>
                        {req.is_mandatory ? '★' : '☆'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{req.requirement_text}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                          {req.is_mandatory ? 'Bắt buộc' : 'Tùy chọn'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột Bên Phải */}
          <div className="space-y-6">
            {/* AI Match Score box */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-green-600 mb-2">90%</div>
                <div className="text-green-800 font-semibold">AI Match Score</div>
              </div>
              <p className="text-sm text-green-700 text-center font-medium">
                Hồ sơ của bạn phù hợp rất cao với vị trí này!
              </p>
            </div>

            {/* Thông Tin Tóm Tắt */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Thông Tin Công Việc</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mức lương</div>
                  <div className="font-semibold text-[#0ea5e9]">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cấp độ kinh nghiệm</div>
                  <div className="font-semibold">{job.experience_level || "Không yêu cầu"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Chỉ tiêu tuyển dụng</div>
                  <div className="font-semibold">{job.vacancy_count || 1} người</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Hạn nộp hồ sơ</div>
                  <div className="font-semibold">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </div>
                </div>
              </div>
            </div>

            {/* Về Công Ty */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Về Công Ty</h3>
              <div className="flex items-center gap-3 mb-4">
                {job.company_id ? (
                  <Link to={`/companies/${job.company_id}`} className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl font-bold text-white hover:opacity-90 transition-opacity">
                    {companyLogo}
                  </Link>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                    {companyLogo}
                  </div>
                )}
                <div>
                  {job.company_id ? (
                    <Link to={`/companies/${job.company_id}`} className="font-bold text-gray-800 hover:text-[#0ea5e9] transition-colors">
                      {job.company_name || "Công ty chưa xác minh"}
                    </Link>
                  ) : (
                    <div className="font-bold text-gray-800">{job.company_name || "Công ty chưa xác minh"}</div>
                  )}
                  <div className="text-xs text-gray-500">Doanh nghiệp tuyển dụng</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {job.company_description || "Nhà tuyển dụng chuyên nghiệp cung cấp môi trường làm việc năng động và chế độ đãi ngộ tốt."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default JobDetail;
