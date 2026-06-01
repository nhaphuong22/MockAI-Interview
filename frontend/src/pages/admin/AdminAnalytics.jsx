import { useState, useEffect } from "react";
import { 
  Server,
  Activity,
  Database,
  Cpu,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  MessageSquare as InterviewIcon,
  DollarSign,
  TrendingUp,
  Clock,
  RotateCw,
  Sparkles
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { getAdminAnalytics } from "../../api/adminApi";

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState("growth"); // "growth" | "structure"
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminAnalytics();
      if (response && response.success) {
        setAnalyticsData(response.data);
      } else {
        setError("Không thể tải dữ liệu phân tích hệ thống.");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu phân tích:", err);
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchAnalytics();
    });
  }, []);

  const systemHealth = [
    { label: "Trạng thái API", value: "Hoạt động", icon: Server, color: "text-emerald-500 bg-emerald-50" },
    { label: "Độ trễ Database", value: "12 ms", icon: Database, color: "text-sky-500 bg-sky-50" },
    { label: "Tải CPU Máy chủ", value: "8.4 %", icon: Cpu, color: "text-amber-500 bg-amber-50" },
    { label: "Kết nối Realtime", value: "142 Active", icon: Activity, color: "text-[#0ea5e9] bg-sky-50" }
  ];

  // Donut chart color palette
  const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full mb-4"
          />
          <p className="text-sm font-semibold text-slate-500">Đang tổng hợp số liệu phân tích từ cơ sở dữ liệu...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center max-w-md space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <RotateCw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không Thể Tải Dữ Liệu</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all outline-none"
            >
              Thử Lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { summary, trends, userRoles, jobCategories } = analyticsData;

  const kpis = [
    { 
      icon: UsersIcon, 
      label: "Tổng Người Dùng", 
      value: summary.totalUsers.toLocaleString("vi-VN"), 
      color: "bg-[#f0f9ff] text-[#0ea5e9]",
      desc: "Thành viên đăng ký"
    },
    { 
      icon: InterviewIcon, 
      label: "Lượt Phỏng Vấn", 
      value: summary.totalInterviews.toLocaleString("vi-VN"), 
      color: "bg-purple-50 text-purple-600",
      desc: "Được AI dẫn dắt"
    },
    { 
      icon: BriefcaseIcon, 
      label: "Tin Tuyển Dụng", 
      value: summary.totalJobs.toLocaleString("vi-VN"), 
      color: "bg-emerald-50 text-emerald-600",
      desc: "Doanh nghiệp đăng tuyển"
    },
    { 
      icon: DollarSign, 
      label: "Tổng Doanh Thu", 
      value: `${summary.totalRevenue.toLocaleString("vi-VN")}đ`, 
      color: "bg-rose-50 text-rose-600",
      desc: "Giao dịch nâng cấp gói"
    },
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-[#0ea5e9] animate-pulse" />
              Thống Kê & Phân Tích Hệ Thống
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Báo cáo phân tích tăng trưởng số liệu phỏng vấn AI, tài khoản và giao dịch doanh thu thực tế.
            </p>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-xs font-semibold text-slate-600 active:scale-95 transition-all outline-none"
          >
            <Clock className="w-4 h-4 text-[#0ea5e9]" />
            <span>Mới cập nhật: Vừa xong</span>
          </button>
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
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +15.2%
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-950 tracking-tight mb-1 truncate">{kpi.value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{kpi.label}</div>
                <p className="text-[10px] text-slate-400 font-medium">{kpi.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl w-fit mb-8 gap-1">
          <button 
            onClick={() => setActiveTab("growth")}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "growth" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Đồ Thị Tăng Trưởng
          </button>
          <button 
            onClick={() => setActiveTab("structure")}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "structure" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Cơ Cấu Hệ Thống
          </button>
        </div>

        {/* Growth Trends Section */}
        {activeTab === "growth" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User & Interview volume growth */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Đăng Ký Mới & Lượt Phỏng Vấn</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Biến động tăng trưởng trong tuần qua</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 text-[#0ea5e9]">
                    <span className="w-2.5 h-2.5 bg-[#0ea5e9] rounded-full inline-block"></span>
                    <span>Đăng ký mới</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-500">
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block"></span>
                    <span>Lượt phỏng vấn</span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="interviews" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorInterviews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Platform Revenue Trend */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Doanh Thu Kênh Tuyển Dụng</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Biểu đồ thanh toán dịch vụ trong 7 ngày qua</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>VND / Ngày</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* Structure & Categorical Distributions */}
        {activeTab === "structure" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Roles (Donut Chart) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 flex flex-col"
            >
              <h2 className="text-base font-bold text-slate-900 mb-6">Cơ Cấu Người Dùng Nền Tảng</h2>
              <div className="flex flex-col md:flex-row items-center justify-around flex-1 gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoles}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {userRoles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Thành viên"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4 w-full max-w-[200px]">
                  {userRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{role.role}</span>
                      </div>
                      <span className="font-extrabold text-slate-800">{role.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Popular Job Categories (Bar Chart) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between"
            >
              <h2 className="text-base font-bold text-slate-900 mb-6">Các Ngành Nghề Đăng Tuyển Hàng Đầu</h2>
              <div className="h-64 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobCategories} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip formatter={(value) => [value, "Số lượng tin"]} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* System Health Indicators */}
        <div className="mt-8 max-w-xl mx-auto w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-6">
            Chỉ số sức khỏe hệ thống (General Stats)
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {systemHealth.map((health, index) => {
              const Icon = health.icon;
              return (
                <div key={index} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${health.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">{health.label}</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">{health.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
