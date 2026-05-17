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
        <h1 className="text-3xl mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-[#E8580C]" />
                <span className="text-sm text-green-600">{stat.trend}</span>
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
