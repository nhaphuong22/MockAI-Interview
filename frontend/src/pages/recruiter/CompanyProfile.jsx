import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2, Globe, Briefcase, Users, FileText, Camera, Loader2, Save,
  MapPin, Mail, Phone, Eye, EyeOff, CheckCircle2, Upload, ChevronRight, Edit3, ExternalLink, X, Heart
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

import { updateProfileApi, uploadAvatarApi, requestCompanyEmailOtpApi, verifyCompanyEmailOtpApi, resendCompanyEmailOtpApi } from "../../api/auth";
import { updateProfileApi, uploadAvatarApi } from "../../api/auth";
import { companyApi } from "../../api/companyApi";
import MDEditor from "@uiw/react-md-editor";

// ─── Constants ──────────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  "Công nghệ thông tin", "Phần mềm & Dịch vụ CNTT", "Thương mại điện tử", "Tài chính - Ngân hàng",
  "Bất động sản", "Giáo dục & Đào tạo", "Y tế & Dược phẩm", "Marketing & Truyền thông",
  "Sản xuất & Chế biến", "Logistics & Vận tải", "Xây dựng", "Du lịch & Khách sạn",
  "Bán lẻ", "Nông nghiệp", "Năng lượng & Môi trường", "Tư vấn quản lý", "Pháp lý",
  "Thiết kế & Sáng tạo", "Viễn thông", "Khác",
];

const COMPANY_SIZE_OPTIONS = [
  "1 - 10 nhân viên", "11 - 50 nhân viên", "51 - 200 nhân viên",
  "201 - 500 nhân viên", "501 - 1000 nhân viên", "1000+ nhân viên",
];

const CITY_OPTIONS = [
  "Thành phố Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Thành phố Hải Phòng",
  "Thành phố Đà Nẵng",
  "Thành phố Cần Thơ",
  "Thành phố Huế",
  "Tỉnh Cao Bằng",
  "Tỉnh Điện Biên",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Lai Châu",
  "Tỉnh Lạng Sơn",
  "Tỉnh Nghệ An",
  "Tỉnh Quảng Ninh",
  "Tỉnh Thanh Hóa",
  "Tỉnh Sơn La",
  "Tỉnh Tuyên Quang",
  "Tỉnh Lào Cai",
  "Tỉnh Thái Nguyên",
  "Tỉnh Phú Thọ",
  "Tỉnh Bắc Ninh",
  "Tỉnh Hưng Yên",
  "Tỉnh Ninh Bình",
  "Tỉnh Quảng Trị",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Gia Lai",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lâm Đồng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Đồng Nai",
  "Tỉnh Tây Ninh",
  "Tỉnh Vĩnh Long",
  "Tỉnh Đồng Tháp",
  "Tỉnh Cà Mau",
  "Tỉnh An Giang"
].sort((a, b) => a.localeCompare(b, 'vi'));

// ─── Reusable Sub-components (outside to prevent re-mount on re-render) ────────

const SelectField = ({ label, name, icon: Icon, options, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2">
      <Icon size={16} className="text-[#0ea5e9]" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-700 dark:text-white font-medium appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
  </div>
);

const InputField = ({ label, name, icon: Icon, placeholder, type = "text", value, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-2">
      <Icon size={16} className="text-[#0ea5e9]" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-slate-700 dark:text-white font-medium"
    />
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

export function CompanyProfile() {
  const { user, setAuth } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    companyWebsite: "",
    companyDescription: "",
    companySize: "",
    companyIndustry: "",
    companyCity: "",
    companyAddress: "",
    contactEmail: "",
    contactPhone: "",
    contactPublic: true,
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef(null);
  const [provinces, setProvinces] = useState([]);

  
  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["company-followers", user?.company_id],
    queryFn: async () => {
      const res = await companyApi.getCompanyFollowers(user.company_id);
      return res.data;
    },
    enabled: !!user?.company_id && !isEditing,
  });


  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
        if (response.ok && isMounted) {
          const data = await response.json();
          const sortedProvinces = data.map(p => p.name).sort((a, b) => a.localeCompare(b, 'vi'));
          setProvinces(sortedProvinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces from API v2:", error);
      }
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  useEffect(() => {
    if (user) {
      const companyName = user.company_name || user.companyName || "";
      setFormData({
        companyName,
        companyLogo: user.company_logo || user.companyLogo || "",
        companyWebsite: user.company_website || user.companyWebsite || "",
        companyDescription: user.company_description || user.companyDescription || "",
        companySize: user.company_size || user.companySize || "",
        companyIndustry: user.company_industry || user.companyIndustry || "",
        companyCity: user.company_city || user.companyCity || "",
        companyAddress: user.company_address || user.companyAddress || "",
        contactEmail: user.contact_email || user.contactEmail || "",
        contactPhone: user.contact_phone || user.contactPhone || "",
        contactPublic: user.contact_public !== undefined ? user.contact_public : (user.contactPublic !== undefined ? user.contactPublic : true),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateProfileApi(data),
    onSuccess: (response) => {
      setAuth(response.data);
      showToast("Cập nhật hồ sơ công ty thành công!", "success");
      setIsEditing(false); // Lưu thành công thì chuyển về chế độ View
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hồ sơ.", "error");
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: (data) => requestCompanyEmailOtpApi(data),
    onSuccess: () => {
      setShowOtpModal(true);
      setOtpCountdown(60);
      setOtpValue("");
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Lỗi gửi OTP.", "error");
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => verifyCompanyEmailOtpApi(data),
    onSuccess: (response) => {
      setAuth(response.data);
      showToast("Cập nhật hồ sơ công ty thành công!", "success");
      setIsEditing(false);
      setShowOtpModal(false);
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Mã OTP không hợp lệ.", "error");
    }
  });

  const resendOtpMutation = useMutation({
    mutationFn: (data) => resendCompanyEmailOtpApi(data),
    onSuccess: () => {
      setOtpCountdown(60);
      showToast("Đã gửi lại OTP thành công.", "success");
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Lỗi gửi lại OTP.", "error");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      showToast("Vui lòng nhập tên công ty.", "error");
      return;
    }
    if (!formData.contactEmail.trim()) {
      showToast("Vui lòng nhập email liên hệ.", "error");
      return;
    }
    
    const originalEmail = user.contact_email || user.contactEmail || "";
    const isVerified = user.contact_email_verified === true || user.contactEmailVerified === true;
    
    if (formData.contactEmail !== originalEmail || !isVerified) {
      requestOtpMutation.mutate({ contactEmail: formData.contactEmail, companyData: formData });
    } else {
      updateProfileMutation.mutate(formData);
    }
  };

  const processFileUpload = useCallback(async (file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh khác.", "error");
      return;
    }
    setIsUploadingLogo(true);
    try {
      const response = await uploadAvatarApi(file);
      if (response?.data?.avatarUrl) {
        setFormData((prev) => ({ ...prev, companyLogo: response.data.avatarUrl }));
        showToast("Tải logo lên thành công!", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Không thể tải ảnh lên. Vui lòng thử lại.", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  }, [showToast]);

  const handleFileUpload = async (e) => processFileUpload(e.target.files[0]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFileUpload(file);
    } else {
      showToast("Vui lòng chọn file ảnh (JPG, PNG).", "error");
    }
  }, [processFileUpload, showToast]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-inter relative">

      {/* ── Toast Notification ──────────────────────────────────────────── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-rose-50/90 border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-rose-500 font-bold text-sm">!</span>
              </div>
            )}
            <p className="font-bold text-sm">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-sky-100/80 rounded-2xl text-sky-500 shadow-sm border border-sky-100">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Hồ sơ Công ty</h1>
              <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm font-medium">Thông tin đại diện doanh nghiệp trên hệ thống.</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold rounded-xl hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
            >
              <Edit3 size={18} />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          )}
        </motion.div>

        {/* ── Main Content Area ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 dark:border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"></div>

          {!isEditing ? (
            // ================= VIEW MODE =================
            <div className="space-y-10 relative z-10">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-slate-100 dark:border-white/10">
                <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white shrink-0">
                  {formData.companyLogo ? (
                    <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <Building2 size={56} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {formData.companyName || "Chưa cập nhật tên công ty"}
                    </h2>
                    <div className="mt-3 flex items-center gap-3">
                      {formData.companyIndustry && (
                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-lg">
                          {formData.companyIndustry}
                        </span>
                      )}
                      {user?.company_id && (
                        <button 
                          onClick={() => setShowFollowersModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 font-semibold text-sm rounded-lg transition-colors border border-rose-100 dark:border-rose-900"
                        >
                          <Heart size={16} className="fill-rose-500 text-rose-500" />
                          <span>{isLoadingFollowers ? "..." : followers.length} người theo dõi</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-medium text-slate-600 dark:text-gray-300">
                    {formData.companySize && (
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-slate-400" />
                        <span>{formData.companySize}</span>
                      </div>
                    )}
                    {formData.companyWebsite && (
                      <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                        <Globe size={18} className="text-slate-400" />
                        <span>Website công ty</span>
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Address & Contact grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MapPin className="text-sky-500" size={20} />
                    Trụ sở chính
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-white/5">
                    {formData.companyCity ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="text-slate-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
                          {formData.companyAddress ? `${formData.companyAddress}, ` : ""}{formData.companyCity}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-sm">Chưa cập nhật địa chỉ</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Phone className="text-sky-500" size={20} />
                    Thông tin liên hệ
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-white/5 space-y-3">
                    {!formData.contactEmail && !formData.contactPhone ? (
                       <p className="text-slate-400 italic text-sm">Chưa cập nhật thông tin liên hệ</p>
                    ) : (
                      <>
                        {formData.contactEmail && (
                          <div className="flex items-center gap-3 text-slate-700 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm shrink-0"><Mail size={14} /></div>
                            <span className="font-medium text-sm break-all leading-tight">{formData.contactEmail}</span>
                          </div>
                        )}
                        {formData.contactPhone && (
                          <div className="flex items-center gap-3 text-slate-700 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm shrink-0"><Phone size={14} /></div>
                            <span className="font-medium text-sm leading-tight">{formData.contactPhone}</span>
                          </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                            {formData.contactPublic ? <Eye size={14} className="text-emerald-500"/> : <EyeOff size={14} className="text-rose-400"/>}
                            {formData.contactPublic ? "Đang hiển thị công khai" : "Đang ẩn với ứng viên"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="text-sky-500" size={20} />
                    Giới thiệu về công ty
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-100 dark:border-white/5">
                    {formData.companyDescription ? (
                      <div data-color-mode="light" className="wmde-markdown-var">
                        <MDEditor.Markdown source={formData.companyDescription} style={{ backgroundColor: 'transparent' }} />
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-center mt-10">Chưa có bài viết giới thiệu công ty.</p>
                    )}
                  </div>
              </div>

            </div>
          ) : (
            // ================= EDIT MODE =================
            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-6 mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Chỉnh sửa hồ sơ</h2>
                 <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
                 >
                   <X size={18} /> Hủy bỏ
                 </button>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm"><Camera className="w-4 h-4" /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Logo Doanh nghiệp</h3>
                </div>
                <div
                  className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed transition-all ${
                    isDragging
                      ? "border-sky-400 bg-sky-50/50 dark:bg-sky-900/10"
                      : "border-slate-200 dark:border-white/10 hover:border-sky-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {formData.companyLogo ? (
                        <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Building2 size={48} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-2xl">
                        {isUploadingLogo ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                        <span className="text-xs mt-1">Đổi logo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-gray-300 font-medium mb-1">
                      <Upload size={18} className="text-sky-500" />
                      <span>Kéo thả hoặc click để tải ảnh lên</span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-gray-500">Định dạng: JPG, PNG. Tối đa: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm"><Briefcase className="w-4 h-4" /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông tin cơ bản</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Tên công ty *" name="companyName" icon={Building2} placeholder="Ví dụ: TechCorp Vietnam" value={formData.companyName} onChange={handleChange} />
                  <InputField label="Website công ty" name="companyWebsite" icon={Globe} placeholder="https://..." value={formData.companyWebsite} onChange={handleChange} />
                  <SelectField label="Ngành nghề" name="companyIndustry" icon={Briefcase} options={INDUSTRY_OPTIONS} placeholder="-- Chọn ngành nghề --" value={formData.companyIndustry} onChange={handleChange} />
                  <SelectField label="Quy mô nhân sự" name="companySize" icon={Users} options={COMPANY_SIZE_OPTIONS} placeholder="-- Chọn quy mô --" value={formData.companySize} onChange={handleChange} />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm"><MapPin className="w-4 h-4" /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Địa chỉ trụ sở</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField label="Tỉnh / Thành phố" name="companyCity" icon={MapPin} options={provinces.length > 0 ? provinces : CITY_OPTIONS} placeholder="-- Chọn tỉnh / thành phố --" value={formData.companyCity} onChange={handleChange} />
                  <InputField label="Địa chỉ chi tiết" name="companyAddress" icon={MapPin} placeholder="Số nhà, đường, quận/huyện..." value={formData.companyAddress} onChange={handleChange} />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm"><Phone className="w-4 h-4" /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông tin liên hệ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Email liên hệ" name="contactEmail" icon={Mail} placeholder="hr@congty.com" type="email" value={formData.contactEmail} onChange={handleChange} />
                  <InputField label="Số điện thoại" name="contactPhone" icon={Phone} placeholder="0901 234 567" value={formData.contactPhone} onChange={handleChange} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, contactPublic: !prev.contactPublic }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.contactPublic ? "bg-sky-500" : "bg-slate-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        formData.contactPublic ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    {formData.contactPublic ? <Eye size={16} className="text-sky-500" /> : <EyeOff size={16} className="text-slate-400" />}
                    {formData.contactPublic ? "Hiện công khai cho ứng viên" : "Ẩn thông tin liên hệ"}
                  </span>
                </div>
              </div>

              {/* Rich Text Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm"><FileText className="w-4 h-4" /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Giới thiệu về công ty</h3>
                </div>
                <div data-color-mode="light" className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <MDEditor
                    value={formData.companyDescription}
                    onChange={(val) => setFormData((prev) => ({ ...prev, companyDescription: val || "" }))}
                    height={280}
                    preview="edit"
                    textareaProps={{
                      placeholder: "Giới thiệu sứ mệnh, văn hóa, sản phẩm của công ty...\n\nBạn có thể sử dụng **in đậm**, *in nghiêng*, chèn [link](url), hoặc tạo danh sách:\n- Điểm nổi bật 1\n- Điểm nổi bật 2",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">Hỗ trợ Markdown: **in đậm**, *in nghiêng*, [link](url), danh sách, tiêu đề.</p>
              </div>

              {/* Submit */}
              <div className="pt-8 mt-4 border-t border-slate-100 dark:border-white/10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 py-4 bg-slate-100 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={requestOtpMutation.isPending || updateProfileMutation.isPending}
                  className="flex-1 py-4 bg-sky-500 text-white font-bold text-lg rounded-2xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:bg-sky-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {requestOtpMutation.isPending || updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lưu Thay Đổi
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          )}
        </motion.div>
      </div>


      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !verifyOtpMutation.isPending && setShowOtpModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowOtpModal(false)}
                disabled={verifyOtpMutation.isPending}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Xác Thực Email</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mã OTP 6 số đã được gửi tới email<br/>
                  <strong className="text-slate-700 dark:text-slate-300">{formData.contactEmail}</strong>
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={otpValue[index] || ''}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        if (pastedData) {
                          setOtpValue(pastedData);
                          const focusIndex = Math.min(pastedData.length, 5);
                          document.getElementById(`otp-input-${focusIndex}`)?.focus();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val) {
                          const newOtp = otpValue.split('');
                          newOtp[index] = val;
                          setOtpValue(newOtp.join('').slice(0, 6));
                          if (index < 5) document.getElementById(`otp-input-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          const newOtp = otpValue.split('');
                          if (!newOtp[index] && index > 0) {
                            document.getElementById(`otp-input-${index - 1}`)?.focus();
                          }
                          newOtp[index] = '';
                          setOtpValue(newOtp.join(''));
                        } else if (e.key === 'ArrowLeft' && index > 0) {
                          document.getElementById(`otp-input-${index - 1}`)?.focus();
                        } else if (e.key === 'ArrowRight' && index < 5) {
                          document.getElementById(`otp-input-${index + 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all dark:text-white shadow-inner"
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => verifyOtpMutation.mutate({ contactEmail: formData.contactEmail, otp: otpValue })}
                  disabled={otpValue.length !== 6 || verifyOtpMutation.isPending}
                  className="w-full py-4 bg-sky-500 text-white font-bold text-lg rounded-2xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:bg-sky-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {verifyOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {verifyOtpMutation.isPending ? "Đang xác thực..." : "Xác Nhận OTP"}
                </motion.button>
                
                <div className="text-center">
                  <button 
                    onClick={() => resendOtpMutation.mutate({ contactEmail: formData.contactEmail })}
                    disabled={otpCountdown > 0 || resendOtpMutation.isPending}
                    className="text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendOtpMutation.isPending ? "Đang gửi lại..." : (otpCountdown > 0 ? `Gửi lại mã sau ${otpCountdown}s` : "Gửi lại mã OTP")}
                  </button>
                </div>

      {/* ── Followers Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFollowersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFollowersModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-100 dark:border-white/10 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> 
                  Danh sách theo dõi
                  <span className="bg-rose-100 text-rose-600 text-xs py-0.5 px-2 rounded-full ml-1">
                    {followers.length}
                  </span>
                </h3>
                <button onClick={() => setShowFollowersModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {isLoadingFollowers ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Đang tải danh sách...</p>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có ai theo dõi công ty của bạn.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followers.map((f) => (
                      <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center overflow-hidden shrink-0 border border-white dark:border-slate-700 shadow-sm">
                          {f.avatar_url ? (
                            <img src={f.avatar_url} alt={f.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sky-600 dark:text-sky-400 text-lg">
                              {f.full_name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-white truncate">{f.full_name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{f.title || "Ứng viên"}</p>
                          {f.city && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <MapPin size={12} /> <span className="truncate">{f.city}</span>
                            </div>
                          )}
                        </div>
                        <a href={`mailto:${f.email}`} className="p-2.5 rounded-full bg-white dark:bg-slate-700 text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-600 transition-colors border border-slate-100 dark:border-transparent shadow-sm">
                          <Mail size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
