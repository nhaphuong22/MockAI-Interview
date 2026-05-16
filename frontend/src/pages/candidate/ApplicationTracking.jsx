import { Clock, CheckCircle2, XCircle, Eye, FileText, Calendar, Info } from "lucide-react";
import { useState } from "react";
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
      { step: "Nộp hồ sơ", completed: true, date: "10/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "10/05/2026", score: 95 },
      { step: "Chờ phản hồi", completed: false, date: null },
      { step: "Phỏng vấn Nhà Tuyển Dụng", completed: false, date: null },
      { step: "Kết quả cuối cùng", completed: false, date: null },
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
      { step: "Nộp hồ sơ", completed: true, date: "08/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "08/05/2026", score: 88 },
      { step: "Chờ phản hồi", completed: true, date: "09/05/2026" },
      { step: "Phỏng vấn Nhà Tuyển Dụng", completed: false, date: "20/05/2026 - 10:00" },
      { step: "Kết quả cuối cùng", completed: false, date: null },
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
      { step: "Nộp hồ sơ", completed: true, date: "05/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "05/05/2026", score: 65 },
      { step: "Thông báo kết quả", completed: true, date: "06/05/2026" },
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
      { step: "Nộp hồ sơ", completed: true, date: "03/05/2026" },
      { step: "Phỏng vấn AI", completed: true, date: "03/05/2026", score: 92 },
      { step: "Phỏng vấn Nhà Tuyển Dụng", completed: true, date: "05/05/2026" },
      { step: "Phỏng vấn Manager", completed: true, date: "07/05/2026" },
      { step: "Trúng tuyển", completed: true, date: "08/05/2026" },
    ],
  },
];

const statusConfig = {
  reviewing: { label: "Đang Xem", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  interview: { label: "Phỏng Vấn", color: "bg-blue-100 text-blue-700", icon: Info },
  accepted: { label: "Đã Tuyển", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Từ Chối", color: "bg-red-100 text-red-700", icon: XCircle },
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
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Theo Dõi Ứng Tuyển</h1>
            <p className="text-lg text-gray-600 font-medium">Trạng thái hồ sơ của bạn đang được xử lý như thế nào?</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-500">
              Tổng cộng: <span className="text-[#0ea5e9]">{stats.total}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50">
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.reviewing}</div>
            <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Đang Xem Hồ Sơ</div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50">
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.interview}</div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Lịch Phỏng Vấn</div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50">
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.accepted}</div>
            <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Đã Trúng Tuyển</div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50">
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.rejected}</div>
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Không Phù Hợp</div>
          </div>
        </div>

        <Tabs.Root defaultValue="all" className="space-y-8">
          <Tabs.List className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-lg shadow-gray-200/30 border border-gray-100 max-w-fit">
            <Tabs.Trigger
              value="all"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300"
            >
              Tất Cả
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reviewing"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300"
            >
              Đang Xét
            </Tabs.Trigger>
            <Tabs.Trigger
              value="interview"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300"
            >
              Phỏng Vấn
            </Tabs.Trigger>
            <Tabs.Trigger
              value="accepted"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300"
            >
              Trúng Tuyển
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="all" className="space-y-6 outline-none">
            {applications.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;
              return (
                <div key={app.id} className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/30 border border-gray-50 hover:border-sky-100 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        {app.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#0ea5e9] transition-colors">{app.title}</h3>
                        <p className="text-lg text-gray-500 font-medium mb-4">{app.company}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Nộp ngày: {new Date(app.appliedDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className={`px-4 py-1 rounded-full flex items-center gap-2 text-xs font-bold ${config.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{config.label.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 lg:max-w-md">
                      <div className="relative">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Tiến trình hồ sơ</h4>
                          <button className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Chi tiết
                          </button>
                        </div>
                        <div className="space-y-6">
                          {app.timeline.map((step, index) => (
                            <div key={index} className="relative flex items-center gap-4">
                              <div className={`z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                step.completed ? "bg-[#0ea5e9] border-[#0ea5e9]" : "bg-white border-gray-200"
                              }`}>
                                {step.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              {index < app.timeline.length - 1 && (
                                <div className={`absolute left-2 top-4 w-px h-6 ${
                                  step.completed ? "bg-[#0ea5e9]" : "bg-gray-100"
                                }`} />
                              )}
                              <div className="flex-1 flex items-center justify-between">
                                <span className={`text-xs font-bold ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                                  {step.step}
                                </span>
                                {step.score && (
                                  <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-lg border border-green-100">
                                    AI: {step.score}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
