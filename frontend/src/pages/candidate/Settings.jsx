import { User, Lock, Bell, CreditCard, Shield, Globe, Moon, HelpCircle, ChevronRight, Briefcase, Mail, Phone, LogOut } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  const menuItems = [
    { id: "account", icon: User, title: "Thông tin cá nhân", desc: "Quản lý tên, email và số điện thoại" },
    { id: "security", icon: Lock, title: "Mật khẩu & Bảo mật", desc: "Đổi mật khẩu và cài đặt 2FA" },
    { id: "notifications", icon: Bell, title: "Cài đặt thông báo", desc: "Quản lý email và thông báo đẩy" },
    { id: "billing", icon: CreditCard, title: "Gói dịch vụ & Thanh toán", desc: "Nâng cấp Pro và lịch sử giao dịch" },
    { id: "privacy", icon: Shield, title: "Quyền riêng tư", desc: "Quản lý dữ liệu và quyền truy cập" },
    { id: "language", icon: Globe, title: "Ngôn ngữ & Vùng", desc: "Tiếng Việt (Việt Nam)" },
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-lg text-gray-600 font-medium">Tùy chỉnh trải nghiệm MockAI theo cách của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-[32px] p-4 shadow-xl shadow-gray-200/20 border border-gray-50">
              <div className="p-6 text-center border-b border-gray-50 mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-sky-100">
                  👨‍💻
                </div>
                <h3 className="text-xl font-bold text-gray-900">Nguyễn Văn A</h3>
                <p className="text-sm text-[#0ea5e9] font-bold uppercase tracking-widest mt-1">Gói Pro Member</p>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                        activeTab === item.id 
                          ? "bg-sky-50 text-[#0ea5e9]" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? "bg-white shadow-sm" : "bg-gray-100 group-hover:bg-white"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{item.title}</div>
                          <div className="text-[10px] opacity-70 font-medium">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? "rotate-90" : "group-hover:translate-x-1"}`} />
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  Đăng xuất
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/20 border border-gray-50 min-h-[600px]">
              {activeTab === "account" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Thông tin cá nhân</h2>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Họ và tên</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            defaultValue="Nguyễn Văn A"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tên hiển thị</label>
                        <input 
                          type="text" 
                          defaultValue="vanna_dev"
                          className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email liên hệ</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          defaultValue="nguyenvana@example.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="tel" 
                          defaultValue="0912 345 678"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vị trí hiện tại</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          defaultValue="Senior Frontend Developer"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button className="px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all shadow-md shadow-sky-100">
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab !== "account" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                  <Settings className="w-20 h-20 mb-6" />
                  <h3 className="text-2xl font-bold">Chức năng đang cập nhật</h3>
                  <p className="font-medium mt-2">Vui lòng quay lại sau</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
