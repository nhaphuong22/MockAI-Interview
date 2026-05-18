import { Clock, CheckCircle2, XCircle, Eye, FileText, Calendar } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";

const applications = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    appliedDate: "2026-05-10",
    status: "reviewing",
    timeline: [
      { step: "Nộp đơn", completed: true, date: "10/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "10/05/2026", score: 95 },
      { step: "Chờ phản hồi", completed: false, date: null },
      { step: "Phỏng vấn HR", completed: false, date: null },
      { step: "Kết quả", completed: false, date: null },
    ],
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Hub",
    logo: "💻",
    appliedDate: "2026-05-08",
    status: "interview",
    timeline: [
      { step: "Nộp đơn", completed: true, date: "08/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "08/05/2026", score: 88 },
      { step: "Chờ phản hồi", completed: true, date: "09/05/2026" },
      { step: "Phỏng vấn HR", completed: false, date: "20/05/2026 - 10:00" },
      { step: "Kết quả", completed: false, date: null },
    ],
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "E-Commerce Plus",
    logo: "📱",
    appliedDate: "2026-05-05",
    status: "rejected",
    timeline: [
      { step: "Nộp đơn", completed: true, date: "05/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "05/05/2026", score: 65 },
      { step: "Từ chối", completed: true, date: "06/05/2026" },
    ],
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "Design Studio",
    logo: "🎨",
    appliedDate: "2026-05-03",
    status: "accepted",
    timeline: [
      { step: "Nộp đơn", completed: true, date: "03/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "03/05/2026", score: 92 },
      { step: "Phỏng vấn HR", completed: true, date: "05/05/2026" },
      { step: "Phỏng vấn Manager", completed: true, date: "07/05/2026" },
      { step: "Trúng tuyển", completed: true, date: "08/05/2026" },
    ],
  },
];

const statusConfig = {
  reviewing: { label: "Đang Xét", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  interview: { label: "Phỏng Vấn", color: "bg-blue-100 text-blue-700", icon: Eye },
  accepted: { label: "Đạt", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Không Đạt", color: "bg-red-100 text-red-700", icon: XCircle },
};

export function ApplicationTracking() {
  const stats = {
    total: applications.length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    interview: applications.filter(a => a.status === "interview").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Theo Dõi Ứng Tuyển</h1>
          <p className="text-gray-600">Quản lý và theo dõi tiến trình các đơn ứng tuyển</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng Đơn</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
            <div className="text-3xl mb-2 text-yellow-700">{stats.reviewing}</div>
            <div className="text-sm text-yellow-700">Đang Xét</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="text-3xl mb-2 text-blue-700">{stats.interview}</div>
            <div className="text-sm text-blue-700">Phỏng Vấn</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="text-3xl mb-2 text-green-700">{stats.accepted}</div>
            <div className="text-sm text-green-700">Đạt</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
            <div className="text-3xl mb-2 text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-700">Không Đạt</div>
          </div>
        </div>

        <Tabs.Root defaultValue="all" className="space-y-6">
          <Tabs.List className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <Tabs.Trigger
              value="all"
              className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[#E8580C] data-[state=active]:text-white transition-all"
            >
              Tất Cả ({stats.total})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reviewing"
              className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[#E8580C] data-[state=active]:text-white transition-all"
            >
              Đang Xét ({stats.reviewing})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="interview"
              className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[#E8580C] data-[state=active]:text-white transition-all"
            >
              Phỏng Vấn ({stats.interview})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="accepted"
              className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[#E8580C] data-[state=active]:text-white transition-all"
            >
              Đạt ({stats.accepted})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="all" className="space-y-6">
            {applications.map((app) => {
              const StatusIcon = statusConfig[app.status as keyof typeof statusConfig].icon;
              return (
                <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {app.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-1">{app.title}</h3>
                      <p className="text-gray-600 mb-3">{app.company}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Nộp: {new Date(app.appliedDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusConfig[app.status as keyof typeof statusConfig].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusConfig[app.status as keyof typeof statusConfig].label}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Xem Chi Tiết</span>
                    </button>
                  </div>

                  <div className="relative pl-8">
                    {app.timeline.map((step, index) => (
                      <div key={index} className="relative pb-8 last:pb-0">
                        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          step.completed
                            ? "bg-[#E8580C] border-[#E8580C]"
                            : "bg-white border-gray-300"
                        }`}>
                          {step.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        {index < app.timeline.length - 1 && (
                          <div className={`absolute left-3 top-6 w-0.5 h-full ${
                            step.completed ? "bg-[#E8580C]" : "bg-gray-300"
                          }`} />
                        )}
                        <div className="pl-8">
                          <div className={`font-semibold ${step.completed ? "text-[#E8580C]" : "text-gray-600"}`}>
                            {step.step}
                            {step.score && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                Score: {step.score}%
                              </span>
                            )}
                          </div>
                          {step.date && (
                            <div className="text-sm text-gray-600 mt-1">{step.date}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Tabs.Content>

          {['reviewing', 'interview', 'accepted'].map(status => (
            <Tabs.Content key={status} value={status} className="space-y-6">
              {applications
                .filter(app => app.status === status)
                .map(app => (
                  <div key={app.id} className="bg-white rounded-2xl p-6">
                    <p className="text-gray-600">Content for {app.title}</p>
                  </div>
                ))}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </div>
  );
}
