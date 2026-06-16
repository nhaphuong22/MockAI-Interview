import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users as UsersIcon, 
  Building as BuildingIcon, 
  FileText as FileTextIcon, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { AdminSidebar } from "./AdminSidebar";
import confetti from "canvas-confetti";
import { getAdminAnalytics, getAllAdminJobs, updateJobApproval } from "../../api/adminApi";
import { axiosClient } from "../../api/axiosClient";
import { useUiStore } from "../../store/useUiStore";

// Hàm format tiền tệ (triệu, tỷ)
const formatMoney = (amount) => {
  if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(1) + 'M';
  return amount.toLocaleString('vi-VN');
};

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  // 1. Fetch Analytics Data
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await getAdminAnalytics();
      return res.data;
    }
  });

  // 2. Fetch Pending Companies
  const { data: pendingCompanies = [], isLoading: isCompaniesLoading } = useQuery({
    queryKey: ['pendingVerificationsDashboard'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/pending');
      return res.data.map(u => ({
        id: u.id,
        name: u.company_name,
        industry: "IT / Tech", // Mock industry for now
        status: "Pending",
        logo: "🏢",
        employees: 50,
      }));
    }
  });

  // 3. Fetch Pending Jobs
  const { data: pendingJobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['pendingJobsDashboard'],
    queryFn: async () => {
      const res = await getAllAdminJobs();
      return res.data.filter(j => j.approval_status === "PENDING").map(j => ({
        id: j.id,
        title: j.title,
        company: j.company_name || "Công ty ẩn danh",
        salary: j.salary_range || "Thỏa thuận"
      }));
    }
  });

  // Mutations
  const verifyCompanyMutation = useMutation({
    mutationFn: async (id) => {
      await axiosClient.post(`/verification/${id}/review`, { status: 'APPROVED' });
    },
    onSuccess: () => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#0ea5e9', '#38bdf8', '#0284c7'] });
      queryClient.invalidateQueries(['pendingVerificationsDashboard']);
      queryClient.invalidateQueries(['adminAnalytics']);
    },
    onError: () => showToast({ message: 'Lỗi duyệt công ty', type: 'error' })
  });

  const jobApprovalMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await updateJobApproval(id, status);
    },
    onSuccess: (data, variables) => {
      if (variables.status === "APPROVED") {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#0ea5e9', '#10b981'] });
      }
      queryClient.invalidateQueries(['pendingJobsDashboard']);
      queryClient.invalidateQueries(['adminAnalytics']);
    },
    onError: () => showToast({ message: 'Lỗi cập nhật trạng thái tin', type: 'error' })
  });

  const isLoading = isAnalyticsLoading || isCompaniesLoading || isJobsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin" />
        </main>
      </div>
    );
  }

  const { summary, trends, recentTransactions } = analytics || {};

  const kpis = [
    { 
      icon: UsersIcon, 
      label: "Tổng Người Dùng", 
      value: summary?.totalUsers || 0, 
      trend: "+12.5%", 
      desc: "so với tháng trước",
      color: "bg-[#f0f9ff] text-[#0ea5e9]"
    },
    { 
      icon: BuildingIcon, 
      label: "Doanh Nghiệp", 
      value: summary?.totalCompanies || 0, 
      trend: "+8.2%", 
      desc: "số liệu thực tế",
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      icon: FileTextIcon, 
      label: "Tin Tuyển Dụng", 
      value: summary?.totalJobs || 0, 
      trend: "+15.4%", 
      desc: `${summary?.pendingJobs || 0} tin chờ duyệt`,
      color: "bg-amber-50 text-amber-600"
    },
    { 
      icon: DollarSign, 
      label: "Doanh Thu", 
      value: formatMoney(summary?.totalRevenue || 0), 
      trend: "+23.1%", 
      desc: "tổng doanh thu",
      color: "bg-rose-50 text-rose-600"
    },
  ];

  // Map trends to chart format
  const revenueData = (trends || []).slice().reverse().map(t => ({
    month: t.dayLabel,
    revenue: (t.revenue / 1000000).toFixed(1), // convert to Millions
    users: t.users
  }));

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng Quan Hệ Thống</h1>
            <p className="text-sm text-slate-500 mt-1">Chào mừng quay trở lại, Quản trị viên. Dưới đây là báo cáo vận hành hôm nay.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-xs font-semibold text-slate-600">
            <Clock className="w-4 h-4 text-[#0ea5e9]" />
            <span>Cập nhật: Vừa xong</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${kpi.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {kpi.trend}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-950 tracking-tight mb-1">{kpi.value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{kpi.label}</div>
                <p className="text-[10px] text-slate-400 font-medium">{kpi.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Doanh Thu & Tăng Trưởng Người Dùng</h2>
                <p className="text-xs text-slate-400 mt-0.5">Thống kê 7 ngày gần nhất</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-[#0ea5e9]">
                  <span className="w-2.5 h-2.5 bg-[#0ea5e9] rounded-full inline-block"></span>
                  <span>Doanh thu (Triệu)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block"></span>
                  <span>Người dùng</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 flex flex-col"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6">Giao Dịch Gần Đây</h2>
            <div className="space-y-5 flex-1 overflow-y-auto max-h-[260px] pr-1">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((txn, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      txn.status === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {txn.status === "Success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {txn.user} <span className="font-normal text-slate-500">đã mua</span> {txn.package}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{txn.date} • <span className="font-semibold text-slate-600">{txn.amount.toLocaleString('vi-VN')}đ</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  Chưa có giao dịch nào gần đây.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Approvals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Verification Approval */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Duyệt Xác Thực Doanh Nghiệp</h2>
              <span className="text-xs bg-sky-50 text-[#0ea5e9] px-2.5 py-0.5 rounded-full font-bold">
                {pendingCompanies.length} chờ duyệt
              </span>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingCompanies.length > 0 ? (
                  pendingCompanies.map(comp => (
                    <motion.div 
                      key={comp.id}
                      layout
                      exit={{ opacity: 0, x: -30 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm border border-slate-100">
                          {comp.logo}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{comp.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{comp.industry} • Qm: {comp.employees}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => verifyCompanyMutation.mutate(comp.id)}
                        disabled={verifyCompanyMutation.isPending}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all outline-none disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Xác Thực
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    🎉 Đã duyệt xong tất cả doanh nghiệp!
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Job Approvals */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Duyệt Tin Tuyển Dụng</h2>
              <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full font-bold">
                {pendingJobs.length} tin chờ duyệt
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingJobs.length > 0 ? (
                  pendingJobs.map(job => (
                    <motion.div 
                      key={job.id}
                      layout
                      exit={{ opacity: 0, x: 30 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.company} • Lương: {job.salary}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => jobApprovalMutation.mutate({ id: job.id, status: "REJECTED" })}
                          disabled={jobApprovalMutation.isPending}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg active:scale-90 transition-all outline-none disabled:opacity-50"
                          title="Từ chối"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => jobApprovalMutation.mutate({ id: job.id, status: "APPROVED" })}
                          disabled={jobApprovalMutation.isPending}
                          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all outline-none disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Duyệt Tin
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    🎉 Không có tin tuyển dụng nào đang chờ duyệt!
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
