import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, Lock, AlertCircle, CheckCircle2, ChevronDown, Users } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { updateProfileApi, uploadAvatarApi, changePasswordApi } from "../../../api/auth";

const InputField = ({ label, name, icon: Icon, placeholder, value, onChange, type = "text", disabled = false, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2">
      <Icon size={16} className="text-[#0ea5e9] shrink-0" />
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-sm
          ${disabled 
            ? "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/5 cursor-not-allowed" 
            : "bg-white dark:bg-[#0f172a] text-slate-800 dark:text-white border-slate-200 dark:border-white/10"
          }`}
      />
    </div>
  </div>
);

const SelectField = ({ label, name, icon: Icon, value, onChange, options, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2">
      <Icon size={16} className="text-[#0ea5e9] shrink-0" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-10 rounded-xl border outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-sm bg-white dark:bg-[#0f172a] text-slate-800 dark:text-white border-slate-200 dark:border-white/10 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

export function AccountInfoTab({ onComplete }) {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    gender: "OTHER",
    avatarUrl: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        gender: user.gender || "OTHER",
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
      if (onComplete) onComplete();
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
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
      setPasswordMessage({ type: "success", text: "Đổi mật khẩu tài khoản thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
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
    setPasswordMessage({ type: "", text: "" });

    // Validate nghiệp vụ Đổi mật khẩu
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng điền đầy đủ tất cả các trường mật khẩu." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải chứa ít nhất 6 ký tự." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới và Xác nhận mật khẩu mới không khớp!" });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await uploadAvatarApi(file);
      if (response?.data?.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: response.data.avatarUrl }));
        setMessage({ type: "success", text: "Tải ảnh lên thành công! Nhấn Lưu thay đổi để lưu lại." });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Không thể tải ảnh lên. Vui lòng thử lại." });
    } finally {
      setIsUploading(false);
    }
  };

  const genderOptions = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác / Bảo mật" },
  ];

  return (
    <div className="space-y-10 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cập nhật thông tin cá nhân */}
      <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-white/10 overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <User size={20} className="text-[#0ea5e9]" />
            Thông tin cá nhân
          </h2>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold
                  ${message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400' 
                    : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                  }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-slate-50/30 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="HR Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                )}
                
                {/* Overlay upload ảnh hiệu ứng Glassmorphic */}
                <label className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                  {isUploading ? <Loader2 className="animate-spin text-white" size={20} /> : <Camera size={20} className="text-white" />}
                  <span className="text-[10px] font-bold mt-1">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Ảnh đại diện HR</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                Hỗ trợ định dạng JPG, PNG hoặc GIF. <br />Khuyên dùng ảnh chụp chân dung nghiêm túc, rõ mặt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Họ và tên HR" name="fullName" icon={User} value={formData.fullName} onChange={handleChange} placeholder="Tên của bạn..." />
            <InputField label="Email tài khoản (Không thể sửa)" name="email" icon={Mail} value={user?.email || ""} disabled={true} />
            <InputField label="Số điện thoại liên hệ" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} placeholder="Nhập SĐT liên hệ..." />
            <SelectField label="Giới tính" name="gender" icon={Users} value={formData.gender} onChange={handleChange} options={genderOptions} />
            <InputField label="Địa chỉ văn phòng cá nhân" name="address" icon={MapPin} value={formData.address} onChange={handleChange} placeholder="Nơi làm việc..." className="md:col-span-2" />
          </div>

          <div className="pt-6 mt-8 border-t border-slate-100 dark:border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_14px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {updateProfileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-white/10 overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Lock size={20} className="text-[#0ea5e9]" />
            Bảo mật & Đổi mật khẩu
          </h2>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {passwordMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold
                  ${passwordMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400' 
                    : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                  }`}
              >
                {passwordMessage.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                <span>{passwordMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              placeholder="Min 6 ký tự..." 
            />
            <InputField 
              label="Xác nhận mật khẩu mới" 
              name="confirmNewPassword" 
              type="password" 
              icon={Lock} 
              value={passwordData.confirmNewPassword} 
              onChange={handlePasswordChange} 
              placeholder="Nhập lại mật khẩu mới..." 
            />
          </div>

          <div className="pt-6 mt-8 border-t border-slate-100 dark:border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15)] dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {changePasswordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
