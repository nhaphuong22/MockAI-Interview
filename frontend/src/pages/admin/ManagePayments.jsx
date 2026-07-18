import { useState } from "react";
import {
  Search,
  CreditCard,
  Percent,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
  Coins,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Pencil,
  Check,
  X,
  Power
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./AdminSidebar";
import paymentApi from "../../api/paymentApi";
import { useUiStore } from "../../store/useUiStore";

// ─── Coupon state (Removed INITIAL_COUPONS as we use API now) ──────────────

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatVnd = (amount) =>
  Number(amount).toLocaleString("vi-VN") + "đ";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const STATUS_CONFIG = {
  COMPLETED: { label: "Thành Công", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle, iconColor: "text-emerald-500" },
  PENDING:   { label: "Đang Xử Lý", bg: "bg-amber-50",   text: "text-amber-700",   icon: Loader2,      iconColor: "text-amber-500" },
  FAILED:    { label: "Thất Bại",   bg: "bg-rose-50",    text: "text-rose-700",    icon: XCircle,      iconColor: "text-rose-500" },
  REFUNDED:  { label: "Hoàn Tiền",  bg: "bg-slate-50",   text: "text-slate-600",   icon: RefreshCw,    iconColor: "text-slate-400" },
};

// ─── Sub-components ────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <AlertCircle className="w-12 h-12 text-rose-400" />
      <p className="text-slate-600 font-medium">{message || "Không thể tải dữ liệu."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-xl text-sm font-bold hover:bg-[#0284c7] transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Thử Lại
        </button>
      )}
    </div>
  );
}

// Package card for admin management
function PackageCard({ pkg, onToggle, isToggling, onUpdatePrice, isUpdatingPrice }) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  const handleEditClick = () => {
    setPriceInput(String(Number(pkg.price)));
    setIsEditingPrice(true);
  };

  const handlePriceConfirm = () => {
    const val = parseFloat(priceInput);
    if (isNaN(val) || val < 0) return;
    onUpdatePrice(pkg.id, val);
    setIsEditingPrice(false);
  };

  const handlePriceCancel = () => {
    setIsEditingPrice(false);
    setPriceInput("");
  };

  const isCandidate = pkg.target_role === "CANDIDATE";
  const isHr = pkg.target_role === "HR";
  const isActive = pkg.is_active;

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-4 transition-all ${isActive ? "border-slate-100 hover:shadow-md" : "border-slate-200 opacity-60 bg-slate-50/50"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isCandidate ? "bg-sky-50 text-[#0ea5e9]" : "bg-amber-50 text-amber-700"}`}>
            {isCandidate ? "CANDIDATE" : "HR / Doanh nghiệp"}
          </span>
          <h3 className="text-sm font-bold text-slate-800 mt-2 leading-snug">{pkg.name}</h3>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${isActive ? "bg-emerald-400" : "bg-slate-300"}`} />
      </div>

      {/* Pricing */}
      <div>
        {isEditingPrice ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              step="1000"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePriceConfirm(); if (e.key === 'Escape') handlePriceCancel(); }}
              autoFocus
              className="w-full px-2 py-1 text-sm font-bold border border-[#0ea5e9] rounded-lg focus:outline-none text-slate-800"
            />
            <button
              onClick={handlePriceConfirm}
              disabled={isUpdatingPrice}
              className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 active:scale-90 transition-all disabled:opacity-50"
            >
              {isUpdatingPrice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handlePriceCancel}
              className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 active:scale-90 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-xl font-extrabold text-slate-900">
              {Number(pkg.price) <= 0 ? (isHr && Number(pkg.price) < 0 ? "Liên Hệ" : "Miễn Phí") : formatVnd(pkg.price)}
            </div>
            <button
              onClick={handleEditClick}
              title="Sửa giá"
              className="p-1 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors active:scale-90"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {isHr && pkg.total_credits > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600">{Number(pkg.total_credits).toLocaleString("vi-VN")} Credit</span>
          </div>
        )}
        {isCandidate && pkg.duration_days > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-500">{pkg.duration_days === 365 ? "1 năm" : `${pkg.duration_days} ngày`}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1 text-[10px] text-slate-400 border-t border-slate-50 pt-3">
        <Users className="w-3 h-3" />
        <span>{Number(pkg.total_sold || 0).toLocaleString("vi-VN")} giao dịch thành công</span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => onToggle(pkg.id)}
        disabled={isToggling}
        className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${isActive ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
      >
        {isToggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isActive ? (
          <><ToggleRight className="w-3.5 h-3.5" />Tắt Gói</>
        ) : (
          <><ToggleLeft className="w-3.5 h-3.5" />Bật Gói</>
        )}
      </button>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────
function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterUserType, setFilterUserType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "transactions", page, filterUserType, filterStatus, debouncedSearch],
    queryFn: () => paymentApi.getTransactionsAdmin({
      page, limit: 20, user_type: filterUserType, status: filterStatus, search: debouncedSearch
    }),
    // axiosClient interceptor đã unwrap response.data rồi
    // nên queryFn trả thẳng: { success: true, data: [...], meta: {...} }
    select: (res) => res,
    keepPreviousData: true,
  });

  const transactions = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._txnSearchTimer);
    window._txnSearchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <motion.div key="transactions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã GD, tên, email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterUserType}
            onChange={handleFilterChange(setFilterUserType)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="">Tất Cả Loại</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="HR">HR / Recruiter</option>
          </select>
          <select
            value={filterStatus}
            onChange={handleFilterChange(setFilterStatus)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="COMPLETED">Thành Công</option>
            <option value="PENDING">Đang Xử Lý</option>
            <option value="FAILED">Thất Bại</option>
            <option value="REFUNDED">Hoàn Tiền</option>
          </select>
        </div>
        {meta.total > 0 && (
          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            {meta.total.toLocaleString("vi-VN")} giao dịch
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6"><LoadingSkeleton /></div>
        ) : isError ? (
          <ErrorState message="Không thể tải lịch sử giao dịch." onRetry={refetch} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4">Mã GD</th>
                    <th className="px-5 py-4">Khách Hàng</th>
                    <th className="px-5 py-4">Loại</th>
                    <th className="px-5 py-4">Gói Dịch Vụ</th>
                    <th className="px-5 py-4">Số Tiền</th>
                    <th className="px-5 py-4">Thời Gian</th>
                    <th className="px-5 py-4 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {transactions.length > 0 ? transactions.map((txn) => {
                    const statusCfg = STATUS_CONFIG[txn.status] || STATUS_CONFIG.FAILED;
                    const StatusIcon = statusCfg.icon;
                    const snap = txn.snapshot_package;
                    const isHr = txn.user_type?.toUpperCase() === "HR";
                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-[10px] font-bold text-slate-400 font-mono">
                          {txn.transaction_code || `#${txn.id}`}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800 text-xs">{txn.user_name || "—"}</div>
                          <div className="text-[10px] text-slate-400">{txn.user_email}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isHr ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-[#0ea5e9]"}`}>
                            {isHr ? "HR" : "CANDIDATE"}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-xs font-semibold text-slate-700">
                            {snap?.name || "—"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {snap?.package_type === "CREDIT_BUNDLE"
                              ? `${Number(snap.total_credits).toLocaleString("vi-VN")} credit`
                              : snap?.duration_days === 365 ? "1 năm" : snap?.duration_days ? `${snap.duration_days} ngày` : ""}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-xs font-extrabold text-slate-900">
                          {formatVnd(txn.amount)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-[10px] text-slate-500 font-medium">
                          {formatDate(txn.created_at)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${statusCfg.bg} ${statusCfg.text}`}>
                            <StatusIcon className={`w-3 h-3 ${statusCfg.iconColor}`} />
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 font-medium text-xs">
                        Không tìm thấy giao dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Trang {meta.page} / {meta.totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-600">{page}</span>
                  <button
                    onClick={() => { setPage((p) => Math.min(meta.totalPages, p + 1)); window.scrollTo(0, 0); }}
                    disabled={page >= meta.totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Packages Tab ─────────────────────────────────────────────────────────
function PackagesTab() {
  const queryClient = useQueryClient();
  const { showToast } = useUiStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "packages"],
    queryFn: paymentApi.getAllPackagesAdmin,
    // axiosClient interceptor đã unwrap response.data rồi
    // nên queryFn trả thẳng: { success: true, data: [...] }
    select: (res) => res?.data || [],
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => paymentApi.togglePackageStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      showToast({ message: "Cập nhật trạng thái gói thành công!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Cập nhật thất bại, vui lòng thử lại.", type: "error" });
    }
  });

  const priceMutation = useMutation({
    mutationFn: ({ id, price }) => paymentApi.updatePackagePrice(id, price),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      showToast({ message: data?.message || "Cập nhật giá thành công!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Cập nhật giá thất bại, vui lòng thử lại.", type: "error" });
    }
  });

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState message="Không thể tải danh sách gói dịch vụ." onRetry={refetch} />;

  const candidatePkgs = (data || []).filter((p) => p.target_role === "CANDIDATE");
  const hrPkgs = (data || []).filter((p) => p.target_role === "HR");

  const renderGroup = (title, icon, pkgs, colorClass) => (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${colorClass}`}>
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="text-[10px] text-slate-400">({pkgs.length} gói)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {pkgs.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onToggle={(id) => toggleMutation.mutate(id)}
            isToggling={toggleMutation.isPending && toggleMutation.variables === pkg.id}
            onUpdatePrice={(id, price) => priceMutation.mutate({ id, price })}
            isUpdatingPrice={priceMutation.isPending && priceMutation.variables?.id === pkg.id}
          />
        ))}
      </div>
    </div>
  );

  return (
    <motion.div key="packages" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-10">
      {renderGroup(
        "Gói Ứng Viên (Subscription)",
        <CreditCard className="w-4 h-4" />,
        candidatePkgs,
        "text-[#0ea5e9]"
      )}
      {renderGroup(
        "Gói HR / Credit Bundle",
        <Coins className="w-4 h-4" />,
        hrPkgs,
        "text-amber-600"
      )}
    </motion.div>
  );
}

// ─── Coupons Tab ──────────────────────────────────────────────────────────
function CouponsTab() {
  const queryClient = useQueryClient();
  const { showToast } = useUiStore();
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponExpiry, setNewCouponExpiry] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [applicableTo, setApplicableTo] = useState("ALL");

  const { data: couponsResponse, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => paymentApi.getCouponsAdmin()
  });

  const coupons = couponsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: paymentApi.createCouponAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setNewCouponCode("");
      setNewCouponDiscount("");
      setNewCouponExpiry("");
      setMaxDiscountAmount("");
      setUsageLimit("");
      setApplicableTo("ALL");
      showToast("Tạo mã giảm giá thành công", "success");
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Lỗi khi tạo mã giảm giá", "error");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: paymentApi.toggleCouponStatusAdmin,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      showToast(res.data?.message || "Đã cập nhật trạng thái", "success");
    },
    onError: (error) => showToast(error.response?.data?.message || "Lỗi cập nhật trạng thái", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: paymentApi.deleteCouponAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      showToast("Đã xóa mã giảm giá thành công", "success");
    },
    onError: (error) => showToast("Lỗi khi xóa mã giảm giá", "error")
  });

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) {
      showToast("Vui lòng nhập mã và % giảm giá", "error");
      return;
    }
    
    createMutation.mutate({
      code: newCouponCode,
      discount_percent: newCouponDiscount,
      max_discount_amount: maxDiscountAmount || undefined,
      usage_limit: usageLimit || undefined,
      applicable_to: applicableTo,
      expires_at: newCouponExpiry || undefined
    });
  };

  return (
    <motion.div key="coupons" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Cột trái: Form tạo */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm h-fit">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1">
          <Plus className="w-4 h-4 text-[#0ea5e9]" />
          Tạo Mã Giảm Giá Mới
        </h3>
        <form onSubmit={handleAddCoupon} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Mã Coupon *</label>
            <input type="text" placeholder="VD: MOCKAI50" value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700 uppercase placeholder:normal-case" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Giảm (%) *</label>
              <input type="number" min="1" max="100" placeholder="VD: 50" value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Giảm tối đa (VNĐ)</label>
              <input type="number" min="0" placeholder="VD: 100000" value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Lượt dùng tối đa</label>
              <input type="number" min="1" placeholder="Không giới hạn" value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Đối tượng</label>
              <select value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700"
              >
                <option value="ALL">Tất cả</option>
                <option value="CANDIDATE">Ứng viên</option>
                <option value="HR">Nhà tuyển dụng</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Ngày hết hạn (Tuỳ chọn)</label>
            <input type="date" value={newCouponExpiry}
              onChange={(e) => setNewCouponExpiry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
          </div>

          <button type="submit" disabled={createMutation.isPending}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-slate-300 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm shadow-sky-100 flex items-center justify-center gap-1.5 active:scale-98 transition-all mt-4 outline-none">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {createMutation.isPending ? "Đang tạo..." : "Thêm Mã Giảm Giá"}
          </button>
        </form>
      </div>

      {/* Cột phải: Danh sách */}
      <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
        {isLoading ? (
          <div className="md:col-span-2 py-10 flex flex-col items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Đang tải mã giảm giá...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="md:col-span-2 py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Percent className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {coupons.map((coupon) => (
              <motion.div key={coupon.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex items-start justify-between group transition-colors ${coupon.is_active ? 'border-slate-100' : 'border-slate-200 bg-slate-50'}`}>
                
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${coupon.is_active ? 'bg-sky-50 text-[#0ea5e9]' : 'bg-slate-100 text-slate-400'}`}>
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold tracking-wider font-mono ${coupon.is_active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                        {coupon.code}
                      </h4>
                      {!coupon.is_active && (
                         <span className="text-[9px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">TẮT</span>
                      )}
                    </div>
                    
                    <p className="text-[11px] font-medium text-slate-500 mt-1">Giảm {coupon.discount_percent}% 
                      {coupon.max_discount_amount && ` (Tối đa ${coupon.max_discount_amount.toLocaleString('vi-VN')}đ)`}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                       <span className="bg-slate-100 px-1.5 py-0.5 rounded">{coupon.applicable_to}</span>
                       <span>·</span>
                       <span>Dùng: {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</span>
                    </div>

                    {coupon.expires_at && (
                       <p className="text-[10px] text-amber-500 font-medium mt-1">HSD: {new Date(coupon.expires_at).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                   <button onClick={() => toggleMutation.mutate(coupon.id)} disabled={toggleMutation.isPending}
                     className="p-1.5 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors" title={coupon.is_active ? "Tắt mã" : "Bật mã"}>
                     <Power className="w-4 h-4" />
                   </button>
                   <button onClick={() => { if(window.confirm('Xóa mã giảm giá này khỏi hệ thống?')) deleteMutation.mutate(coupon.id); }} disabled={deleteMutation.isPending}
                     className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa mã">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export function ManagePayments() {
  const [activeTab, setActiveTab] = useState("transactions");

  const tabs = [
    { id: "transactions", label: "Lịch Sử Giao Dịch" },
    { id: "packages",     label: "Quản Lý Gói Dịch Vụ" },
    { id: "coupons",      label: "Mã Giảm Giá" },
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gói & Thanh Toán</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý gói dịch vụ, theo dõi lịch sử giao dịch thực và tạo mã giảm giá.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-8 gap-6 text-sm font-semibold text-slate-400">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 relative transition-colors ${activeTab === tab.id ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="paymentTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "transactions" && <TransactionsTab key="transactions" />}
          {activeTab === "packages"     && <PackagesTab     key="packages" />}
          {activeTab === "coupons"      && <CouponsTab      key="coupons" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
