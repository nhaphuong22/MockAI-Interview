import { User, Lock, Bell, CreditCard, Shield, Globe, ChevronRight, Mail, Phone, LogOut, MapPin, AlignLeft } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { updateProfileApi } from "../../api/auth";

export function Settings() {
  const { user, setAuth, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("account");

  // Form states
  const [fullName, setFullName] = useState(() => user?.full_name || user?.fullName || "");
  const [phone, setPhone] = useState(() => user?.phone || "");
  const [address, setAddress] = useState(() => user?.address || "");
  const [bio, setBio] = useState(() => user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url || user?.avatarUrl || "");

  // Loading & Message states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });


  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await updateProfileApi({
        fullName,
        phone,
        address,
        bio,
        avatarUrl
      });
      if (response.success) {
        // Cập nhật state cục bộ trong Zustand
        setAuth({
          ...user,
          ...response.data
        });
        setMessage({ type: "success", text: "Cập nhật thông tin hồ sơ thành công!" });
      } else {
        setMessage({ type: "error", text: response.message || "Có lỗi xảy ra!" });
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Lỗi kết nối đến máy chủ!" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-sky-100 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    "👨‍💻"
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 truncate">{fullName || "Ứng viên MockAI"}</h3>
                <p className="text-[11px] text-gray-400 font-medium truncate mt-1">{user?.email}</p>
                <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-widest mt-2 px-3 py-1 bg-sky-50 rounded-full inline-block">
                  {user?.role === "HR" ? "Recruiter Member" : "Candidate Member"}
                </p>
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
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
                >
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
                  
                  {message.text && (
                    <div className={`p-4 rounded-2xl mb-6 font-semibold text-sm ${
                      message.type === "success" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Họ và tên</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nhập họ và tên"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email liên hệ (Không thể sửa)</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="email" 
                            value={user?.email || ""}
                            disabled
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Địa chỉ</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ví dụ: Hà Nội, Việt Nam"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Đường dẫn ảnh đại diện (Avatar URL)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Giới thiệu ngắn (Bio)</label>
                      <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Chia sẻ ngắn gọn về bản thân bạn..."
                          rows={4}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium resize-none border border-gray-100"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className={`px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center gap-2 cursor-pointer ${
                          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab !== "account" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                  <User className="w-20 h-20 mb-6" />
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

