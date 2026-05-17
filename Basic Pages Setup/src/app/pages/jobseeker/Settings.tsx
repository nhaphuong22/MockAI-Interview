import { User, Lock, Bell, CreditCard } from "lucide-react";

export function Settings() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl mb-8">Cài Đặt Tài Khoản</h1>
        <div className="space-y-4">
          {[
            { icon: User, title: "Thông tin cá nhân", desc: "Cập nhật thông tin tài khoản" },
            { icon: Lock, title: "Bảo mật", desc: "Đổi mật khẩu và cài đặt bảo mật" },
            { icon: Bell, title: "Thông báo", desc: "Quản lý thông báo email và push" },
            { icon: CreditCard, title: "Gói dịch vụ", desc: "Quản lý subscription và thanh toán" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#E8580C] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFF3ED] rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#E8580C]" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
