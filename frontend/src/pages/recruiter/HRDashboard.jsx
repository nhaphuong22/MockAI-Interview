import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Loader2, 
  Calendar,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { applicationApi } from "../../api/applicationApi";
import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const statusConfig = {
  submitted: { label: "Mới tiếp nhận", color: "bg-blue-50 text-blue-600 border border-blue-100" },
  new: { label: "Mới tiếp nhận", color: "bg-blue-50 text-blue-600 border border-blue-100" },
  reviewing: { label: "Đang xem", color: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
  reviewed: { label: "Đang xem", color: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
  interviewed: { label: "Phỏng vấn", color: "bg-purple-50 text-purple-600 border border-purple-100" },
  accepted: { label: "Trúng tuyển", color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  rejected: { label: "Từ chối", color: "bg-rose-50 text-rose-600 border border-rose-100" },
};

export function HRDashboard() {
  const { user } = useAuthStore();
  const currentHrId = user?.id;

  // Fetch Jobs
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["manage-jobs", currentHrId],
    queryFn: async () => {
      const res = await jobApi.getJobs({ hr_id: currentHrId });
      return res.data;
    },
    enabled: !!currentHrId
  });

  // Fetch Applications
  const { data: appsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ["recruiter-applications", "dashboard"],
    queryFn: async () => {
      const res = await applicationApi.getApplications({});
      return res.data || [];
    },
    enabled: !!currentHrId
  });

  const isLoading = isLoadingJobs || isLoadingApps;
  
  const jobs = Array.isArray(jobsResponse?.items) ? jobsResponse.items : (Array.isArray(jobsResponse) ? jobsResponse : []);
  const applications = Array.isArray(appsResponse) ? appsResponse : [];

  // --- Calculate Metrics ---
  const activeJobsCount = jobs.filter(j => j.status === "OPEN").length;
  const totalAppsCount = applications.length;
  const interviewingCount = applications.filter(a => ["interviewed", "interview_scheduled"].includes(a.status)).length;
  const hiredCount = applications.filter(a => ["accepted", "hired"].includes(a.status)).length;

  const stats = [
    { icon: Briefcase, label: "Tin Đang Mở", value: activeJobsCount, trend: "Tuyển dụng", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700" },
    { icon: Users, label: "Tổng Đơn", value: totalAppsCount, trend: "Ứng viên", color: "bg-sky-500", lightBg: "bg-sky-50", textColor: "text-sky-700" },
    { icon: Calendar, label: "Đang Phỏng Vấn", value: interviewingCount, trend: "Lịch hẹn", color: "bg-purple-500", lightBg: "bg-purple-50", textColor: "text-purple-700" },
    { icon: CheckCircle, label: "Đã Tuyển Dụng", value: hiredCount, trend: "Hoàn tất", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700" },
  ];

  // --- Calculate Chart Data ---
  
  // 1. Bar Chart: Applications by Status
  const statusData = useMemo(() => {
    const counts = { new: 0, reviewing: 0, interviewing: 0, accepted: 0, rejected: 0 };
    applications.forEach(app => {
      const s = app.status;
      if (s === "submitted" || s === "new") counts.new++;
      else if (s === "reviewing" || s === "reviewed") counts.reviewing++;
      else if (s === "interviewed" || s === "interview_scheduled") counts.interviewing++;
      else if (s === "accepted" || s === "hired") counts.accepted++;
      else if (s === "rejected") counts.rejected++;
    });

    return [
      { name: "Mới nhận", value: counts.new, fill: "#3b82f6" },
      { name: "Đang xét", value: counts.reviewing, fill: "#eab308" },
      { name: "Phỏng vấn", value: counts.interviewing, fill: "#a855f7" },
      { name: "Trúng tuyển", value: counts.accepted, fill: "#10b981" },
      { name: "Từ chối", value: counts.rejected, fill: "#f43f5e" }
    ];
  }, [applications]);

  // 2. Line Chart: Applications Over Last 7 Days
  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Build array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      data.push({
        date: dateStr,
        rawDate: d.toDateString(),
        count: 0
      });
    }

    applications.forEach(app => {
      if (app.appliedDate) {
        const appDate = new Date(app.appliedDate);
        const match = data.find(d => new Date(d.rawDate).toDateString() === appDate.toDateString());
        if (match) {
          match.count++;
        }
      }
    });

    return data;
  }, [applications]);

  // --- Recent Applications ---
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 5);
  }, [applications]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50/50">
        <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Đang tải dữ liệu Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tổng Quan (Dashboard)</h1>
            <p className="text-gray-500 mt-2 font-medium">Báo cáo trung tâm tình hình tuyển dụng</p>
          </div>
          <Link 
            to="/hr/dashboard/applications"
            className="px-6 py-2.5 bg-white border-2 border-[#0ea5e9] text-[#0ea5e9] font-bold rounded-xl hover:bg-sky-50 transition-all flex items-center gap-2 shadow-sm"
          >
            Quản Lý Ứng Viên <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 1. Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${stat.lightBg} ${stat.textColor}`}>
                    {stat.trend}
                  </div>
                </div>
                <div className="relative z-10 text-4xl font-black text-gray-900 mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="relative z-10 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </div>
                
                {/* Decorative background circle */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${stat.color}`}></div>
              </div>
            );
          })}
        </div>

        {/* 2. Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Bar Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Tỷ lệ trạng thái hồ sơ
            </h3>
            <div className="h-[300px] w-full">
              {applications.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dx={-10}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có dữ liệu trạng thái</p>
                </div>
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Lưu lượng nộp CV (7 ngày qua)
            </h3>
            <div className="h-[300px] w-full">
              {applications.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dx={-10}
                    />
                    <RechartsTooltip 
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Số đơn nộp"
                      stroke="#0ea5e9" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: "#0ea5e9", strokeWidth: 0 }}
                      activeDot={{ r: 8, fill: "#0ea5e9", stroke: "#e0f2fe", strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có dữ liệu ứng tuyển tuần này</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 3. Recent Activities */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0ea5e9]" /> Ứng viên mới nộp gần đây
            </h3>
            <Link to="/hr/dashboard/applications" className="text-sm font-bold text-[#0ea5e9] hover:underline">
              Xem tất cả
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            {recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chưa có ứng viên nào</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ứng Viên</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vị Trí</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Điểm AI</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng Thái</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-sky-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm text-white font-bold">
                            {app.candidateAvatar && (app.candidateAvatar.startsWith("http") || app.candidateAvatar.startsWith("/") || app.candidateAvatar.includes("upload")) ? (
                              <img src={app.candidateAvatar} alt={app.candidateName} className="w-full h-full object-cover" />
                            ) : (
                              app.candidateName?.substring(0, 1).toUpperCase() || "👨‍💻"
                            )}
                          </div>
                          <div>
                            {(() => {
                              // Parse thông tin từ CV text
                              let displayName = app.candidateName || "";
                              let displayEmail = app.candidateEmail || "";
                              if (app.cvText) {
                                const lines = app.cvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                                if (lines.length > 0) displayName = lines[0];
                                const emailMatch = app.cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
                                if (emailMatch && !emailMatch[0].endsWith('.')) displayEmail = emailMatch[0];
                              }
                              return (
                                <>
                                  <div className="font-bold text-gray-900">{displayName || "Ứng viên"}</div>
                                  <div className="text-xs text-gray-500">{displayEmail || "Chưa có email"}</div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-700">{app.jobTitle}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{app.companyName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          app.aiScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          app.aiScore >= 60 ? "bg-sky-50 text-sky-700 border border-sky-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {app.aiScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap inline-block ${statusConfig[app.status]?.color || "bg-gray-50 text-gray-500 border border-gray-100"}`}>
                          {statusConfig[app.status]?.label || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
