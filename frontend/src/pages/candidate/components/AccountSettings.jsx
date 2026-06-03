import React, { useState } from "react";
import { User, Phone, Mail, MapPin, Globe, AlignLeft } from "lucide-react";
import { updateProfileApi, uploadAvatarApi } from "../../../api/auth";
import { Camera, Loader2 } from "lucide-react";

export function AccountSettings({ user, onUpdateUser }) {
  // Form states
  const [fullName, setFullName] = useState(() => user?.full_name || user?.fullName || "");
  const [phone, setPhone] = useState(() => user?.phone || "");
  const [address, setAddress] = useState(() => user?.address || "");
  const [bio, setBio] = useState(() => user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url || user?.avatarUrl || "");

  // Loading & Message states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng chọn một file ảnh hợp lệ." });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await uploadAvatarApi(file);
      if (response.success && response.data?.avatarUrl) {
        // Construct full URL if necessary or keep relative
        // Example: response.data.avatarUrl is "/uploads/avatars/file.jpg" or a Cloudinary URL
        const url = response.data.avatarUrl;
        const fullUrl = url.startsWith("http://") || url.startsWith("https://")
          ? url
          : (import.meta.env.VITE_API_URL 
              ? import.meta.env.VITE_API_URL.replace("/api", "") + url
              : "http://localhost:5000" + url);
        
        setAvatarUrl(fullUrl);
        setMessage({ type: "success", text: "Tải ảnh lên thành công! Bấm Lưu thay đổi để hoàn tất." });
      } else {
        setMessage({ type: "error", text: response.message || "Tải ảnh thất bại!" });
      }
    } catch (error) {
      console.error("Upload avatar error:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Lỗi khi tải ảnh lên!" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
        onUpdateUser(response.data);
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

  return (
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100 rounded-2xl text-gray-400 cursor-not-allowed font-medium border border-transparent"
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ảnh đại diện</label>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isUploadingAvatar ? "blur-[2px] opacity-40" : ""
                    }`}
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}

                {/* Uploading indicator overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
                    <span className="text-[9px] font-bold text-[#0ea5e9] tracking-wider uppercase">Tải lên...</span>
                  </div>
                )}
              </div>

              {!isUploadingAvatar && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Hoặc dán URL ảnh vào đây..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-100"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">Bạn có thể tải ảnh lên từ máy tính hoặc dán đường dẫn ảnh.</p>
            </div>
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
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all font-medium resize-none border border-gray-100"
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
  );
}
