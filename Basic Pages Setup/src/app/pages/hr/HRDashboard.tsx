import { FileText, Users, CheckCircle, XCircle, Eye, Download, Filter, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

const stats = [
  { icon: FileText, label: "Tổng Đơn", value: 120, trend: "+12%", color: "bg-blue-500" },
  { icon: CheckCircle, label: "Đã Phỏng Vấn AI", value: 85, trend: "+8%", color: "bg-green-500" },
  { icon: TrendingUp, label: "Đang Xét", value: 32, trend: "-5%", color: "bg-orange-500" },
  { icon: Users, label: "Đã Tuyển", value: 8, trend: "+3%", color: "bg-purple-500" },
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
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showAIReport, setShowAIReport] = useState(false);

  const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">HR Dashboard</h1>
            <p className="text-gray-600">Quản lý ứng viên và đánh giá AI</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.trend}
                  </div>
                </div>
                <div className="text-3xl mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex gap-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none"
                />
                <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span>Lọc</span>
                </button>
              </div>
              <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none">
                <option>Tất cả trạng thái</option>
                <option>Mới</option>
                <option>Đang xem</option>
                <option>Mời phỏng vấn</option>
                <option>Đạt</option>
                <option>Không đạt</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Ứng Viên</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Vị Trí</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">AI Score</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Kỹ Năng</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Ngày Nộp</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-full flex items-center justify-center text-lg">
                          {candidate.avatar}
                        </div>
                        <div>
                          <div className="font-semibold">{candidate.name}</div>
                          <div className="text-sm text-gray-600">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{candidate.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBarColor(candidate.aiScore)} transition-all`}
                              style={{ width: `${candidate.aiScore}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-md ${getScoreColor(candidate.aiScore)}`}>
                          {candidate.aiScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-[#FFF3ED] text-[#E8580C] rounded-md text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                            +{candidate.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={candidate.status}
                        className={`px-3 py-1 rounded-full text-sm border-0 outline-none cursor-pointer ${statusConfig[candidate.status as keyof typeof statusConfig].color}`}
                      >
                        <option value="new">Mới</option>
                        <option value="reviewed">Đang Xem</option>
                        <option value="interviewed">Mời Phỏng Vấn</option>
                        <option value="accepted">Đạt</option>
                        <option value="rejected">Không Đạt</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate.id);
                            setShowAIReport(true);
                          }}
                          className="px-3 py-1.5 bg-[#E8580C] text-white rounded-lg hover:bg-[#d14f0a] transition-colors text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem AI Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog.Root open={showAIReport} onOpenChange={setShowAIReport}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50">
              {selectedCandidateData && (
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-full flex items-center justify-center text-3xl">
                        {selectedCandidateData.avatar}
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl mb-1">
                          {selectedCandidateData.name}
                        </Dialog.Title>
                        <p className="text-gray-600">{selectedCandidateData.position}</p>
                      </div>
                    </div>
                    <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <XCircle className="w-6 h-6 text-gray-400" />
                    </Dialog.Close>
                  </div>

                  <div className="bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] rounded-2xl p-6 text-white mb-6">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{selectedCandidateData.aiScore}%</div>
                      <div className="text-lg opacity-90">AI Match Score</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Đánh Giá Kỹ Năng</h3>
                    <div className="relative w-full h-64">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E8580C" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        <polygon
                          points="100,20 172,65 155,150 45,150 28,65"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                        <polygon
                          points="100,50 145,80 135,130 65,130 55,80"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />

                        <polygon
                          points="100,30 160,70 145,140 55,140 40,70"
                          fill="url(#radarGradient)"
                          stroke="#E8580C"
                          strokeWidth="2"
                        />

                        <circle cx="100" cy="30" r="4" fill="#E8580C" />
                        <circle cx="160" cy="70" r="4" fill="#E8580C" />
                        <circle cx="145" cy="140" r="4" fill="#E8580C" />
                        <circle cx="55" cy="140" r="4" fill="#E8580C" />
                        <circle cx="40" cy="70" r="4" fill="#E8580C" />

                        <text x="100" y="10" textAnchor="middle" fontSize="12" fill="#374151">
                          Technical Skills
                        </text>
                        <text x="185" y="70" textAnchor="start" fontSize="12" fill="#374151">
                          Communication
                        </text>
                        <text x="160" y="165" textAnchor="middle" fontSize="12" fill="#374151">
                          Problem Solving
                        </text>
                        <text x="40" y="165" textAnchor="middle" fontSize="12" fill="#374151">
                          Teamwork
                        </text>
                        <text x="15" y="70" textAnchor="end" fontSize="12" fill="#374151">
                          Culture Fit
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">AI Interview Transcript</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 max-h-64 overflow-y-auto">
                      <div>
                        <div className="text-sm text-[#E8580C] mb-1">Q: Describe your experience with React</div>
                        <div className="text-sm text-gray-700 pl-4">
                          I have 5 years of experience working with React, including building large-scale applications...
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#E8580C] mb-1">Q: How do you handle state management?</div>
                        <div className="text-sm text-gray-700 pl-4">
                          I typically use Redux for complex state, but also leverage React Context and hooks for simpler cases...
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#E8580C] mb-1">Q: Tell me about a challenging project</div>
                        <div className="text-sm text-gray-700 pl-4">
                          One of the most challenging projects was rebuilding our company's dashboard with real-time data...
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">AI Summary</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-sm text-gray-700">
                        Ứng viên thể hiện kỹ năng kỹ thuật xuất sắc với kinh nghiệm thực tế tốt.
                        Có khả năng giao tiếp rõ ràng và tư duy giải quyết vấn đề logic.
                        Phù hợp cao với văn hóa công ty và yêu cầu vị trí.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Mời Phỏng Vấn Người</span>
                    </button>
                    <button className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span>Từ Chối</span>
                    </button>
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
