import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, Calendar, Info } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { TrackingStats } from "./components/TrackingStats";
import { ApplicationCard } from "./components/ApplicationCard";

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
  const [activeTab, setActiveTab] = useState("all");

  const stats = {
    total: applications.length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    interview: applications.filter(a => a.status === "interview").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const filteredApplications = activeTab === "all"
    ? applications
    : applications.filter(app => app.status === activeTab);

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

        <TrackingStats stats={stats} />

        <Tabs.Root 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-8"
        >
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

          <Tabs.Content value={activeTab} className="space-y-6 outline-none">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  app={app} 
                  statusConfig={statusConfig} 
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/30 border border-gray-50">
                <p className="text-gray-500 font-medium">Chưa có hồ sơ ứng tuyển nào ở trạng thái này.</p>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
export default ApplicationTracking;
