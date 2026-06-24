import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, Lock } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { updateProfileApi, uploadAvatarApi, changePasswordApi } from "../../api/auth";

const InputField = ({ label, name, icon: Icon, placeholder, value, onChange, type = "text", disabled = false }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
      <Icon size={16} className="text-[#0ea5e9]" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#0ea5e9]/50 focus:border-[#0ea5e9] transition-all ${
        disabled ? "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
      }`}
    />
  </div>
);

export function CompanySettings() {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: user.full_name || user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        avatarUrl: user.avatar_url || user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateProfileApi(data),
    onSuccess: (response) => {
      setAuth(response.data);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setMessage({ type: "success", text: "Cập nhật thông tin cá nhân thành công!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin.",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePasswordApi(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "" });
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 3000);
    },
    onError: (error) => {
      setPasswordMessage({
        type: "error",
        text: error?.response?.data?.message || "Lỗi đổi mật khẩu.",
      });
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadAvatarApi(file);
      if (response?.data?.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Không thể tải ảnh lên. Vui lòng thử lại." });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cài đặt Tài khoản</h1>
          <p className="text-gray-500 dark:text-gray-400">Quản lý thông tin cá nhân và bảo mật tài khoản HR.</p>
        </motion.div>

        {/* Cập nhật thông tin cá nhân */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={20} className="text-[#0ea5e9]" />
              Thông tin cá nhân
            </h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="HR Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                    <span className="text-xs mt-1">Đổi ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ảnh đại diện</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Định dạng JPG, PNG hoặc GIF.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Họ và tên HR" name="fullName" icon={User} value={formData.fullName} onChange={handleChange} placeholder="Tên của bạn..." />
              <InputField label="Email (Không thể thay đổi)" name="email" icon={Mail} value={user?.email || ""} disabled={true} />
              <InputField label="Số điện thoại" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} placeholder="Nhập SĐT liên hệ..." />
              <InputField label="Địa chỉ cá nhân" name="address" icon={MapPin} value={formData.address} onChange={handleChange} placeholder="Nơi làm việc..." />
            </div>

            <div className="pt-6 mt-8 flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-xl transition-colors shadow-lg shadow-[#0ea5e9]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock size={20} className="text-[#0ea5e9]" />
              Bảo mật tài khoản
            </h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8">
            {passwordMessage.text && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="Mật khẩu hiện tại" 
                name="currentPassword" 
                type="password" 
                icon={Lock} 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange} 
                placeholder="••••••••" 
              />
              <InputField 
                label="Mật khẩu mới" 
                name="newPassword" 
                type="password" 
                icon={Lock} 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
                placeholder="••••••••" 
              />
            </div>

            <div className="pt-6 mt-8 flex justify-end">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePasswordMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                Đổi Mật Khẩu
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
