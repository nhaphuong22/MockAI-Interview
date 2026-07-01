import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Save } from "lucide-react";
import { useUiStore } from "../../../store/useUiStore";

export function PackageEditModal({ isOpen, onClose, packageData, onSave, isLoading }) {
  const { showToast } = useUiStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    total_credits: 0,
    is_active: false
  });

  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || "",
        description: packageData.description || "",
        price: packageData.price || 0,
        total_credits: packageData.total_credits || 0,
        is_active: Boolean(packageData.is_active)
      });
    }
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Parse numbers for price and credits
    if (name === 'price' || name === 'total_credits') {
      newValue = value === '' ? '' : Number(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast({ message: "Vui lòng nhập tên gói dịch vụ", type: "error" });
      return;
    }
    onSave(packageData.id, formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Chỉnh Sửa Gói Dịch Vụ</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Mã gói: <span className="text-[#0ea5e9]">{packageData?.id}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form id="package-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên gói <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  placeholder="Ví dụ: Gói Basic, Top Max..."
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giá tiền (VNĐ) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  placeholder="Nhập -1 để hiển thị 'Liên Hệ'"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#0ea5e9]" /> Nhập <span className="font-bold text-slate-700">-1</span> nếu là gói Doanh nghiệp cần thương lượng giá
                </p>
              </div>

              {/* Total Credits (HR only) */}
              {packageData?.target_role === 'HR' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số lượng Credit cung cấp</label>
                  <input
                    type="number"
                    name="total_credits"
                    value={formData.total_credits}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                    placeholder="VD: 50"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Credit được dùng chung cho việc đăng tin và lọc ứng viên AI.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all resize-none"
                  placeholder="Mô tả ưu đãi của gói..."
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">Trạng thái Kích hoạt</p>
                  <p className="text-[10px] text-slate-500 font-medium">Bật để gói hiển thị trên trang bảng giá của người dùng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="package-form"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold rounded-xl shadow-sm shadow-sky-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
