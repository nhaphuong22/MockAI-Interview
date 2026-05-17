import { FileText, Users, CheckCircle, XCircle, Eye, Download, Filter, TrendingUp, Calendar, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";

const stats = [
  { icon: FileText, label: "Tổng Đơn", value: 120, trend: "+12%", color: "bg-blue-500" },
  { icon: CheckCircle, label: "Đã Phỏng Vấn AI", value: 85, trend: "+8%", color: "bg-green-500" },
  { icon: Users, label: "Đang Xét", value: 32, trend: "-5%", color: "bg-sky-500" },
  { icon: TrendingUp, label: "Đã Tuyển", value: 8, trend: "+3%", color: "bg-purple-500" },
];

const candidates = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "👨‍💻",
    email: "nguyenvana@example.com",
    position: "Senior Frontend Developer",
    aiScore: 95,
    skills: ["React", "TypeScript", "Node.js"],
    status: "new",
    appliedDate: "2026-05-10",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "👩‍💼",
    email: "tranthib@example.com",
    position: "Full Stack Developer",
    aiScore: 88,
    skills: ["React", "Python", "PostgreSQL"],
    status: "reviewed",
    appliedDate: "2026-05-09",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "👨‍🎓",
    email: "levanc@example.com",
    position: "Backend Developer",
    aiScore: 82,
    skills: ["Node.js", "MongoDB", "Docker"],
    status: "interviewed",
    appliedDate: "2026-05-08",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: "👩‍🔬",
    email: "phamthid@example.com",
    position: "UI/UX Designer",
    aiScore: 78,
    skills: ["Figma", "Adobe XD", "Prototyping"],
    status: "accepted",
    appliedDate: "2026-05-07",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    avatar: "👨‍🏫",
    email: "hoangvane@example.com",
    position: "Frontend Developer",
    aiScore: 65,
    skills: ["Vue.js", "CSS", "JavaScript"],
    status: "rejected",
    appliedDate: "2026-05-06",
  },
];

const statusConfig = {
  new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
  reviewed: { label: "Đang Xem", color: "bg-yellow-100 text-yellow-700" },
  interviewed: { label: "Mời Phỏng Vấn", color: "bg-purple-100 text-purple-700" },
  accepted: { label: "Đạt", color: "bg-green-100 text-green-700" },
  rejected: { label: "Không Đạt", color: "bg-red-100 text-red-700" },
};

export function HRDashboard() {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showAIReport, setShowAIReport] = useState(false);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-sky-600 bg-sky-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-sky-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản trị Tuyển dụng</h1>
            <p className="text-gray-600 font-medium">Theo dõi ứng viên và phân tích chất lượng bằng AI</p>
          </div>
          <button className="px-6 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl hover:bg-[#0284c7] hover:shadow-lg transition-all flex items-center gap-2 shadow-md shadow-sky-100">
            <Download className="w-5 h-5" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-inner`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.trend}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex gap-4 w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm ứng viên theo tên, email..."
                    className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all"
                  />
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-sky-50 transition-all flex items-center gap-2 font-bold text-gray-600">
                  <Filter className="w-5 h-5" />
                  <span>Bộ lọc</span>
                </button>
              </div>
              <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none font-bold text-gray-700 min-w-[200px]">
                <option>Tất cả trạng thái</option>
                <option>Mới tiếp nhận</option>
                <option>Đang xem hồ sơ</option>
                <option>Mời phỏng vấn</option>
                <option>Đã chấp nhận</option>
                <option>Đã từ chối</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ứng Viên</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vị Trí</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Score</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kỹ Năng</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng Thái</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày Nộp</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full flex items-center justify-center text-lg shadow-sm">
                          {candidate.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors">{candidate.name}</div>
                          <div className="text-xs text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">{candidate.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[80px]">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBarColor(candidate.aiScore)} transition-all duration-500`}
                              style={{ width: `${candidate.aiScore}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${getScoreColor(candidate.aiScore)}`}>
                          {candidate.aiScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-md text-[10px] font-bold uppercase"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[candidate.status].color}`}>
                        {statusConfig[candidate.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCandidateId(candidate.id);
                          setShowAIReport(true);
                        }}
                        className="p-2 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-all"
                        title="Xem chi tiết AI Report"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog.Root open={showAIReport} onOpenChange={setShowAIReport}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50 animate-in zoom-in-95 duration-300 outline-none">
              {selectedCandidate && (
                <div className="relative">
                  <div className="absolute top-6 right-6 z-10">
                    <Dialog.Close className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 outline-none">
                      <XCircle className="w-6 h-6" />
                    </Dialog.Close>
                  </div>

                  <div className="p-10">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-sky-100">
                        {selectedCandidate.avatar}
                      </div>
                      <div>
                        <Dialog.Title className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedCandidate.name}
                        </Dialog.Title>
                        <div className="flex items-center gap-4">
                          <p className="text-gray-500 font-medium">{selectedCandidate.position}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[selectedCandidate.status].color}`}>
                            {statusConfig[selectedCandidate.status].label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                      <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl p-6 text-white text-center shadow-xl shadow-sky-100">
                        <div className="text-4xl font-bold mb-1">{selectedCandidate.aiScore}%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Match Score</div>
                      </div>
                      <div className="bg-green-50 rounded-3xl p-6 text-center border border-green-100">
                        <div className="text-2xl font-bold text-green-700 mb-1">A+</div>
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Kỹ Thuật</div>
                      </div>
                      <div className="bg-sky-50 rounded-3xl p-6 text-center border border-sky-100">
                        <div className="text-2xl font-bold text-sky-700 mb-1">B+</div>
                        <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Giao Tiếp</div>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#0ea5e9]" />
                        Phân tích năng lực (Radar Chart)
                      </h3>
                      <div className="flex justify-center bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          <polygon points="100,20 172,65 155,150 45,150 28,65" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                          <polygon points="100,50 145,80 135,130 65,130 55,80" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                          <polygon points="100,30 160,70 145,140 55,140 40,70" fill="#0ea5e9" fillOpacity="0.1" stroke="#0ea5e9" strokeWidth="2" />
                          <circle cx="100" cy="30" r="3" fill="#0ea5e9" />
                          <circle cx="160" cy="70" r="3" fill="#0ea5e9" />
                          <circle cx="145" cy="140" r="3" fill="#0ea5e9" />
                          <circle cx="55" cy="140" r="3" fill="#0ea5e9" />
                          <circle cx="40" cy="70" r="3" fill="#0ea5e9" />
                          <text x="100" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">KỸ THUẬT</text>
                          <text x="185" y="70" textAnchor="start" fontSize="8" fontWeight="bold" fill="#64748b">GIAO TIẾP</text>
                          <text x="160" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">GIẢI QUYẾT VẤN ĐỀ</text>
                          <text x="40" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">LÀM VIỆC NHÓM</text>
                          <text x="15" y="70" textAnchor="end" fontSize="8" fontWeight="bold" fill="#64748b">VĂN HÓA</text>
                        </svg>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#0ea5e9]" />
                        Tóm tắt từ AI
                      </h3>
                      <div className="bg-sky-50 border-l-4 border-[#0ea5e9] p-6 rounded-2xl">
                        <p className="text-gray-700 leading-relaxed font-medium">
                          Ứng viên có nền tảng kỹ thuật vững chắc, đặc biệt là trong hệ sinh thái React. 
                          Kết quả phỏng vấn AI cho thấy khả năng tư duy hệ thống tốt và sự chủ động trong công việc. 
                          <span className="font-bold text-sky-700"> Khuyên dùng: Mời phỏng vấn trực tiếp vòng 2.</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Mời Phỏng Vấn</span>
                      </button>
                      <button className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        <span>Từ Chối Hồ Sơ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
