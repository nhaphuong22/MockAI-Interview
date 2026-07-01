import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Mail, Phone, Edit, Download, Share2, Camera, Upload, Loader2 } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useUiStore } from "../../../store/useUiStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { uploadAvatarApi, uploadCoverApi } from "../../../api/auth";
import { ImageCropModal } from "../../../components/common/ImageCropModal";
import { getAbsoluteMediaUrl } from "../../../utils/mediaUtils";

export function ProfileHeader({ user, completeness, avatarUrl: propAvatarUrl }) {
  const addToast = useUiStore((state) => state.addToast);
  const { user: storeUser, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const currentUser = storeUser || user || {};

  // Media states
  const rawCoverUrl = currentUser?.cover_url || currentUser?.coverUrl || "";
  const coverUrl = getAbsoluteMediaUrl(rawCoverUrl);
  
  const rawAvatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || propAvatarUrl || "";
  const displayAvatarUrl = rawAvatarUrl.includes("googleusercontent.com")
    ? rawAvatarUrl.replace(/=s\d+(-c)?$/, "=s384-c")
    : getAbsoluteMediaUrl(rawAvatarUrl);

  // Drag states
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // Uploading spinners
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Modal crop state
  const [cropModalData, setCropModalData] = useState({
    isOpen: false,
    imageSrc: null,
    type: null, // "cover" | "avatar"
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Đã sao chép liên kết hồ sơ vào khay nhớ tạm!", "success");
  };

  const handleDownloadCV = () => {
    if (currentUser?.cv_url) {
      window.open(getAbsoluteMediaUrl(currentUser.cv_url), "_blank");
    } else {
      addToast("Bạn chưa tải lên file CV gốc. Vui lòng vào Cài đặt hoặc Đánh giá CV để cập nhật!", "info");
    }
  };

  // Select file trigger
  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Vui lòng chọn một file định dạng hình ảnh hợp lệ!", "error");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropModalData({
      isOpen: true,
      imageSrc: objectUrl,
      type,
    });
    e.target.value = null; // reset input
  };

  // Drag Drop trigger
  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "cover") setIsDraggingCover(false);
    if (type === "avatar") setIsDraggingAvatar(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Vui lòng kéo thả file hình ảnh hợp lệ!", "error");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropModalData({
      isOpen: true,
      imageSrc: objectUrl,
      type,
    });
  }, [addToast]);

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

  // Confirm crop & upload
  const handleCropConfirm = async (croppedFile) => {
    const { type } = cropModalData;
    if (type === "cover") {
      try {
        setIsUploadingCover(true);
        const response = await uploadCoverApi(croppedFile);
        if (response.success || response.data?.coverUrl) {
          const newCoverUrl = response.data?.coverUrl || response.coverUrl;
          setAuth({
            ...currentUser,
            cover_url: newCoverUrl,
            coverUrl: newCoverUrl,
          });
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          addToast("Cập nhật ảnh bìa thành công!", "success");
        }
      } catch (error) {
        console.error("Lỗi khi tải lên ảnh bìa:", error);
        addToast(error.response?.data?.message || "Lỗi khi cập nhật ảnh bìa!", "error");
      } finally {
        setIsUploadingCover(false);
      }
    } else if (type === "avatar") {
      try {
        setIsUploadingAvatar(true);
        const response = await uploadAvatarApi(croppedFile);
        if (response.success || response.data?.avatarUrl) {
          const newAvatarUrl = response.data?.avatarUrl || response.avatarUrl;
          setAuth({
            ...currentUser,
            avatar_url: newAvatarUrl,
            avatarUrl: newAvatarUrl,
          });
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          addToast("Cập nhật ảnh đại diện thành công!", "success");
        }
      } catch (error) {
        console.error("Lỗi khi tải lên ảnh đại diện:", error);
        addToast(error.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện!", "error");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  return (
    <>
      <div className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 overflow-hidden mb-6">
        {/* Cover Photo Banner Area */}
        <div 
          onDragOver={(e) => handleDragOver(e, "cover")}
          onDragLeave={(e) => handleDragLeave(e, "cover")}
          onDrop={(e) => handleDrop(e, "cover")}
          className="h-48 sm:h-64 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] relative group overflow-hidden transition-all"
        >
          {/* Default SVG Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaW力量PSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          {/* Render Cover Photo */}
          {coverUrl && (
            <img 
              src={coverUrl} 
              alt="Cover Banner" 
              className={`w-full h-full object-cover transition-all duration-500 ${isUploadingCover ? "blur-sm scale-105 opacity-60" : ""}`} 
            />
          )}

          {/* Drag Overlay */}
          {isDraggingCover && (
            <div className="absolute inset-0 bg-[#0ea5e9]/80 backdrop-blur-sm border-4 border-dashed border-white z-20 flex flex-col items-center justify-center text-white animate-pulse">
              <Upload className="w-10 h-10 mb-2" />
              <span className="font-bold text-lg">Thả ảnh vào đây để cập nhật ảnh bìa</span>
            </div>
          )}

          {/* Uploading Indicator */}
          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center gap-2 text-white font-bold z-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#38bdf8]" />
              <span>Đang tải lên ảnh bìa...</span>
            </div>
          )}

          {/* Hover Camera Button */}
          {!isUploadingCover && (
            <label className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20 shadow-lg">
              <Camera className="w-4 h-4 text-[#38bdf8]" />
              <span>Thay đổi ảnh bìa</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileSelect(e, "cover")} 
                className="hidden" 
              />
            </label>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-20 relative">
            {/* Avatar Container */}
            <div 
              onDragOver={(e) => handleDragOver(e, "avatar")}
              onDragLeave={(e) => handleDragLeave(e, "avatar")}
              onDrop={(e) => handleDrop(e, "avatar")}
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] ring-4 dark:ring-[#0f172a] ring-white flex items-center justify-center text-6xl flex-shrink-0 overflow-hidden relative group shadow-xl"
            >
              {displayAvatarUrl ? (
                <img 
                  src={displayAvatarUrl} 
                  alt="Avatar" 
                  className={`w-full h-full object-cover transition-all duration-300 ${isUploadingAvatar ? "blur-sm opacity-50" : ""}`} 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                "👨‍💻"
              )}

              {/* Drag Overlay Avatar */}
              {isDraggingAvatar && (
                <div className="absolute inset-0 bg-[#0ea5e9]/90 border-2 border-dashed border-white z-20 flex flex-col items-center justify-center text-white text-center p-2">
                  <Upload className="w-6 h-6 mb-1 animate-bounce" />
                  <span className="text-[10px] font-bold uppercase leading-tight">Thả ảnh đại diện</span>
                </div>
              )}

              {/* Uploading Indicator Avatar */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 text-white z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#38bdf8]" />
                  <span className="text-[10px] font-bold">Đang xử lý...</span>
                </div>
              )}

              {/* Hover Camera Avatar */}
              {!isUploadingAvatar && (
                <label className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10">
                  <Camera className="w-6 h-6 mb-1 text-[#38bdf8]" />
                  <span className="text-xs font-semibold">Đổi ảnh</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, "avatar")} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            <div className="flex-1 pt-2 md:pt-0 md:mt-20">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl dark:text-white font-bold mb-2">{currentUser?.full_name || currentUser?.fullName || "Chưa cập nhật tên"}</h1>
                  <p className="text-lg dark:text-slate-400 text-gray-600 mb-2 font-medium">
                    {currentUser?.role === "HR" ? "Recruiter" : "Candidate Member"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 dark:text-slate-400 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#0ea5e9]" />
                      <span>{currentUser?.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-[#0ea5e9]" />
                      <span>{currentUser?.email || "Chưa cập nhật email"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-[#0ea5e9]" />
                      <span>{currentUser?.phone || "Chưa cập nhật SĐT"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/settings" className="px-4 py-2 border-2 dark:border-white/20 dark:hover:bg-white/10 dark:text-slate-300 border-gray-300 rounded-xl hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all flex items-center gap-2 text-sm font-semibold">
                    <Edit className="w-4 h-4" />
                    <span>Chỉnh Sửa</span>
                  </Link>
                  <button 
                    onClick={handleDownloadCV}
                    className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải CV</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    title="Chia sẻ hồ sơ"
                    className="p-2 border-2 dark:border-white/20 dark:text-slate-300 dark:hover:border-[#0ea5e9] dark:hover:bg-white/10 border-gray-300 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all cursor-pointer"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="dark:bg-[#1e293b] bg-[#f0f9ff] rounded-xl p-4 border border-sky-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm dark:text-slate-300 text-gray-700 font-medium">Hoàn thiện hồ sơ</span>
                  <span className="text-sm font-bold text-[#0ea5e9]">{completeness}%</span>
                </div>
                <Progress.Root className="h-2 dark:bg-[#0f172a] bg-white rounded-full overflow-hidden">
                  <Progress.Indicator
                    className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </Progress.Root>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropping Modal */}
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
