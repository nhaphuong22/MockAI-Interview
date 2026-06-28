import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Phone, Mail, MapPin, Globe, AlignLeft, Linkedin, Github, Camera, Loader2, Upload, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { updateProfileApi, uploadAvatarApi, uploadCoverApi } from "../../../api/auth";
import { ImageCropModal } from "../../../components/common/ImageCropModal";
import { getAbsoluteMediaUrl } from "../../../utils/mediaUtils";

export function AccountSettings({ user, onUpdateUser, focusField }) {
  const queryClient = useQueryClient();
  const linkedinRef = useRef(null);
  const githubRef = useRef(null);
  const portfolioRef = useRef(null);

  useEffect(() => {
    if (!focusField) return;
    const timer = setTimeout(() => {
      if (focusField === "linkedin" && linkedinRef.current) {
        linkedinRef.current.focus();
        linkedinRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (focusField === "github" && githubRef.current) {
        githubRef.current.focus();
        githubRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (focusField === "portfolio" && portfolioRef.current) {
        portfolioRef.current.focus();
        portfolioRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [focusField]);

  // Form states
  const [fullName, setFullName] = useState(() => user?.full_name || user?.fullName || "");
  const [phone, setPhone] = useState(() => user?.phone || "");
  const [address, setAddress] = useState(() => user?.address || "");
  const [bio, setBio] = useState(() => user?.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => user?.linkedin_url || user?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(() => user?.github_url || user?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(() => user?.portfolio_url || user?.portfolioUrl || "");

  const [avatarUrl, setAvatarUrl] = useState(() => {
    const raw = user?.avatar_url || user?.avatarUrl || localStorage.getItem("googleAvatar") || "";
    return getAbsoluteMediaUrl(raw);
  });

  const [coverUrl, setCoverUrl] = useState(() => {
    const raw = user?.cover_url || user?.coverUrl || "";
    return getAbsoluteMediaUrl(raw);
  });

  // Loading & Message states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Drag states
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // Crop Modal state
  const [cropModalData, setCropModalData] = useState({
    isOpen: false,
    imageSrc: null,
    type: null, // "cover" | "avatar"
  });

  const [showUrlInputs, setShowUrlInputs] = useState(false);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng chọn một file ảnh hợp lệ." });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropModalData({ isOpen: true, imageSrc: objectUrl, type });
    e.target.value = null;
  };

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "cover") setIsDraggingCover(false);
    if (type === "avatar") setIsDraggingAvatar(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng kéo thả một file ảnh hợp lệ." });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropModalData({ isOpen: true, imageSrc: objectUrl, type });
  }, []);

  const handleDragOver = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "cover") setIsDraggingCover(true);
    if (type === "avatar") setIsDraggingAvatar(true);
  }, []);

  const handleDragLeave = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "cover") setIsDraggingCover(false);
    if (type === "avatar") setIsDraggingAvatar(false);
  }, []);

  const handleCropConfirm = async (croppedFile) => {
    const { type } = cropModalData;
    setMessage({ type: "", text: "" });

    if (type === "avatar") {
      setIsUploadingAvatar(true);
      try {
        const response = await uploadAvatarApi(croppedFile);
        if (response.success && response.data?.avatarUrl) {
          const fullUrl = getAbsoluteMediaUrl(response.data.avatarUrl);
          setAvatarUrl(fullUrl);
          onUpdateUser({ ...user, avatar_url: response.data.avatarUrl, avatarUrl: response.data.avatarUrl });
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          setMessage({ type: "success", text: "Cập nhật ảnh đại diện thành công!" });
        } else {
          setMessage({ type: "error", text: response.message || "Tải ảnh thất bại!" });
        }
      } catch (error) {
        console.error("Upload avatar error:", error);
        setMessage({ type: "error", text: error.response?.data?.message || "Lỗi khi tải ảnh lên!" });
      } finally {
        setIsUploadingAvatar(false);
      }
    } else if (type === "cover") {
      setIsUploadingCover(true);
      try {
        const response = await uploadCoverApi(croppedFile);
        if (response.success && response.data?.coverUrl) {
          const fullUrl = getAbsoluteMediaUrl(response.data.coverUrl);
          setCoverUrl(fullUrl);
          onUpdateUser({ ...user, cover_url: response.data.coverUrl, coverUrl: response.data.coverUrl });
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          setMessage({ type: "success", text: "Cập nhật ảnh bìa thành công!" });
        } else {
          setMessage({ type: "error", text: response.message || "Tải ảnh bìa thất bại!" });
        }
      } catch (error) {
        console.error("Upload cover error:", error);
        setMessage({ type: "error", text: error.response?.data?.message || "Lỗi khi tải ảnh bìa lên!" });
      } finally {
        setIsUploadingCover(false);
      }
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
        avatarUrl,
        coverUrl,
        linkedinUrl,
        githubUrl,
        portfolioUrl
      });
      if (response.success) {
        onUpdateUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
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
    <>
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Thông tin cá nhân</h2>
        
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
          {/* Unified Profile Header Card */}
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#1e293b]/40 shadow-sm">
            {/* Top Cover Banner */}
            <div 
              onDragOver={(e) => handleDragOver(e, "cover")}
              onDragLeave={(e) => handleDragLeave(e, "cover")}
              onDrop={(e) => handleDrop(e, "cover")}
              className="relative w-full h-32 sm:h-36 bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#0ea5e9]/50 group flex items-center justify-center overflow-hidden transition-all"
            >
              {coverUrl ? (
                <img 
                  src={coverUrl} 
                  alt="Cover" 
                  className={`w-full h-full object-cover transition-all duration-300 ${isUploadingCover ? "blur-[2px] opacity-40" : ""}`} 
                />
              ) : (
                <div className="flex items-center gap-2 text-white/70">
                  <ImageIcon className="w-5 h-5 opacity-70" />
                  <span className="text-xs font-semibold tracking-wide">Kéo thả hoặc nhấn để chọn ảnh bìa</span>
                </div>
              )}

              {/* Drag Overlay */}
              {isDraggingCover && (
                <div className="absolute inset-0 bg-[#0ea5e9]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white animate-pulse">
                  <Upload className="w-8 h-8 mb-1" />
                  <span className="font-bold text-sm">Thả ảnh vào đây</span>
                </div>
              )}

              {/* Uploading indicator */}
              {isUploadingCover && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xs flex items-center justify-center gap-2 z-10">
                  <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
                  <span className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider">Đang tải ảnh bìa...</span>
                </div>
              )}

              {/* Hover Button */}
              {!isUploadingCover && (
                <label className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer opacity-80 group-hover:opacity-100 transition-all shadow-sm z-10">
                  <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{coverUrl ? "Đổi ảnh bìa" : "Thêm ảnh bìa"}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, "cover")} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* Bottom Info Bar */}
            <div className="px-6 pb-6 pt-3 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-10 relative z-10">
                {/* Avatar */}
                <div 
                  onDragOver={(e) => handleDragOver(e, "avatar")}
                  onDragLeave={(e) => handleDragLeave(e, "avatar")}
                  onDrop={(e) => handleDrop(e, "avatar")}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-[#0f172a] shadow-md flex items-center justify-center relative">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          isUploadingAvatar ? "blur-[2px] opacity-40" : ""
                        }`}
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}

                    {isDraggingAvatar && (
                      <div className="absolute inset-0 bg-[#0ea5e9]/90 z-20 flex flex-col items-center justify-center text-white">
                        <Upload className="w-6 h-6 animate-bounce" />
                      </div>
                    )}

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-white dark:bg-[#0f172a]/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 z-10">
                        <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
                      </div>
                    )}
                  </div>

                  {!isUploadingAvatar && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-10">
                      <Camera className="w-5 h-5 mb-1 text-[#38bdf8]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileSelect(e, "avatar")} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* User text summary */}
                <div className="text-center sm:text-left mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{fullName || "Ứng viên MockAI"}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">{user?.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-sky-50 dark:bg-sky-500/10 text-[#0ea5e9] text-[10px] font-bold uppercase tracking-wider rounded-md border border-sky-100 dark:border-sky-500/20">
                    Candidate Member
                  </span>
                </div>
              </div>

              {/* URL toggle button */}
              <button
                type="button"
                onClick={() => setShowUrlInputs(!showUrlInputs)}
                className="px-3.5 py-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span>{showUrlInputs ? "Ẩn dán URL" : "Dán URL ảnh"}</span>
              </button>
            </div>

            {/* Collapsible URL Inputs */}
            {showUrlInputs && (
              <div className="p-5 bg-gray-50 dark:bg-[#0f172a]/50 border-t border-gray-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL Ảnh bìa</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full pl-10 pr-3 py-2 text-xs bg-white dark:bg-white/5 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL Ảnh đại diện</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full pl-10 pr-3 py-2 text-xs bg-white dark:bg-white/5 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-400 rounded-2xl cursor-not-allowed font-medium border border-transparent dark:border-white/5"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10"
                />
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium resize-none border border-gray-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Mạng xã hội & Trang web cá nhân</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    ref={linkedinRef}
                    type="text" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10 ring-offset-2 focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">GitHub URL</label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    ref={githubRef}
                    type="text" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="github.com/username"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10 ring-offset-2 focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trang cá nhân / Portfolio URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    ref={portfolioRef}
                    type="text" 
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-[#1e293b] focus:border-[#0ea5e9] focus:outline-none transition-all font-medium border border-gray-200 dark:border-white/10 ring-offset-2 focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="button"
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className={`px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all shadow-md shadow-sky-100 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      <ImageCropModal
        isOpen={cropModalData.isOpen}
        onClose={() => setCropModalData((prev) => ({ ...prev, isOpen: false }))}
        imageSrc={cropModalData.imageSrc}
        aspect={cropModalData.type === "cover" ? 16 / 5 : 1}
        title={cropModalData.type === "cover" ? "Căn chỉnh Ảnh bìa" : "Căn chỉnh Ảnh đại diện"}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}
