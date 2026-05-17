import { Users, Building, FileText, DollarSign } from "lucide-react";

export function AdminDashboard() {
  const stats = [
    { icon: Users, label: "Người Dùng", value: "12,456", trend: "+12%" },
    { icon: Building, label: "Công Ty", value: "1,234", trend: "+8%" },
    { icon: FileText, label: "Tin Đăng", value: "5,678", trend: "+15%" },
    { icon: DollarSign, label: "Doanh Thu", value: "234M", trend: "+23%" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Tổng quan Hệ thống</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#f0f9ff] rounded-xl">
                    <Icon className="w-6 h-6 text-[#0ea5e9]" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">{stat.trend}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
