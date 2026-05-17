import { useParams, Link } from "react-router";
import { MapPin, DollarSign, Briefcase, Clock, Building, Users, Award, ChevronRight, Bookmark, Share2, Flag } from "lucide-react";
import { useState } from "react";

export function JobDetail() {
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const job = {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    location: "Hà Nội",
    salary: "25-35 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "3-5 năm",
    tags: ["React", "TypeScript", "Node.js"],
    aiMatch: 95,
    posted: "2 ngày trước",
    applicants: 45,
    views: 1203,
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/jobs" className="flex items-center gap-2 text-gray-600 hover:text-[#E8580C] transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                  {job.logo}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-gray-700 mb-3">
                    <Building className="w-5 h-5" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E8580C] font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                      {job.remote}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button className="flex-1 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all">
                  Nộp Đơn Ngay
                </button>
                <button className="flex-1 py-3 border-2 border-[#E8580C] text-[#E8580C] rounded-xl hover:bg-[#FFF3ED] transition-all">
                  Phỏng Vấn AI Trước
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#E8580C] text-[#E8580C]" : ""}`} />
                  <span>{isBookmarked ? "Đã lưu" : "Lưu việc"}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all ml-auto">
                  <Flag className="w-5 h-5" />
                  <span>Báo cáo</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl mb-6">Mô Tả Công Việc</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  Chúng tôi đang tìm kiếm một Senior Frontend Developer tài năng để tham gia vào đội ngũ
                  phát triển sản phẩm. Bạn sẽ chịu trách nhiệm xây dựng và duy trì các ứng dụng web
                  hiện đại với công nghệ tiên tiến nhất.
                </p>

                <h3 className="text-xl mb-3 mt-6">Trách nhiệm chính:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Phát triển các tính năng mới cho ứng dụng web sử dụng React và TypeScript</li>
                  <li>Tối ưu hóa hiệu suất và trải nghiệm người dùng</li>
                  <li>Làm việc cùng team backend để tích hợp API</li>
                  <li>Code review và mentor các junior developers</li>
                  <li>Tham gia vào quy trình CI/CD và automation testing</li>
                </ul>

                <h3 className="text-xl mb-3 mt-6">Yêu cầu:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>3-5 năm kinh nghiệm phát triển Frontend</li>
                  <li>Thành thạo React, TypeScript, HTML5, CSS3</li>
                  <li>Kinh nghiệm với state management (Redux, MobX, Zustand)</li>
                  <li>Hiểu biết về RESTful API và GraphQL</li>
                  <li>Kỹ năng giao tiếp tốt và làm việc nhóm</li>
                </ul>

                <h3 className="text-xl mb-3 mt-6">Phúc lợi:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Lương cạnh tranh: 25-35 triệu VND</li>
                  <li>Thưởng theo hiệu suất công việc</li>
                  <li>Bảo hiểm sức khỏe cao cấp</li>
                  <li>Làm việc linh hoạt (Hybrid)</li>
                  <li>13th month salary + Performance bonus</li>
                  <li>Môi trường làm việc trẻ trung, năng động</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl mb-6">Kỹ Năng Yêu Cầu</h2>
              <div className="flex flex-wrap gap-3">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-[#FFF3ED] text-[#E8580C] rounded-xl"
                  >
                    {tag}
                  </span>
                ))}
                <span className="px-4 py-2 bg-[#FFF3ED] text-[#E8580C] rounded-xl">HTML5</span>
                <span className="px-4 py-2 bg-[#FFF3ED] text-[#E8580C] rounded-xl">CSS3</span>
                <span className="px-4 py-2 bg-[#FFF3ED] text-[#E8580C] rounded-xl">Redux</span>
                <span className="px-4 py-2 bg-[#FFF3ED] text-[#E8580C] rounded-xl">Git</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-center mb-4">
                <div className="text-5xl text-green-600 mb-2">{job.aiMatch}%</div>
                <div className="text-green-800">AI Match Score</div>
              </div>
              <p className="text-sm text-green-700 text-center">
                Hồ sơ của bạn phù hợp rất cao với vị trí này!
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-4">Thông Tin Công Việc</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mức lương</div>
                  <div className="font-semibold text-[#E8580C]">{job.salary}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Kinh nghiệm</div>
                  <div className="font-semibold">{job.experience}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Hình thức</div>
                  <div className="font-semibold">{job.type} - {job.remote}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Số lượng tuyển</div>
                  <div className="font-semibold">2 người</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Hạn nộp</div>
                  <div className="font-semibold">30/06/2026</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-4">Thống Kê</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Ứng viên</span>
                  </div>
                  <span className="font-semibold">{job.applicants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Lượt xem</span>
                  </div>
                  <span className="font-semibold">{job.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">Đăng</span>
                  </div>
                  <span className="font-semibold">{job.posted}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-4">Về Công Ty</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-xl flex items-center justify-center text-2xl">
                  {job.logo}
                </div>
                <div>
                  <div className="font-semibold">{job.company}</div>
                  <div className="text-sm text-gray-600">Công ty TNHH</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                TechCorp Vietnam là công ty công nghệ hàng đầu chuyên phát triển các sản phẩm SaaS
                cho thị trường Đông Nam Á.
              </p>
              <Link
                to="/company/1"
                className="block text-center py-2 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] hover:text-[#E8580C] transition-all"
              >
                Xem trang công ty
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
