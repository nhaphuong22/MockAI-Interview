import { useState } from "react";
import { 
  Search, 
  Percent, 
  Trash2, 
  Plus, 
  CheckCircle, 
  XCircle,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { mockTransactions as initialTxns } from "./mockAdminData";

export function ManagePayments() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [txns] = useState(initialTxns);
  const [searchTerm, setSearchTerm] = useState("");

  // Pricing Packages state
  const [packages, setPackages] = useState([
    { id: "PKG-1", name: "Premium Member 1 Month", user: "Candidate", price: 199000, duration: "30 ngày", active: true },
    { id: "PKG-2", name: "Gold Job Post Bundle (10 Posts)", user: "Recruiter", price: 2500000, duration: "Vĩnh viễn", active: true },
    { id: "PKG-3", name: "Diamond Recruiter Pack (Unlimited)", user: "Recruiter", price: 4900000, duration: "1 năm", active: true }
  ]);

  // Coupons state
  const [coupons, setCoupons] = useState([
    { code: "MOCKAI50", discount: 50, expiry: "2026-06-30", active: true },
    { code: "HELLOSUMMER", discount: 20, expiry: "2026-08-31", active: true },
    { code: "WELCOMENEW", discount: 15, expiry: "2026-12-31", active: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponExpiry, setNewCouponExpiry] = useState("2026-06-30");

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    
    setCoupons(prev => [
      ...prev,
      {
        code: newCouponCode.toUpperCase(),
        discount: parseInt(newCouponDiscount),
        expiry: newCouponExpiry,
        active: true
      }
    ]);
    
    setNewCouponCode("");
    setNewCouponDiscount("");
  };

  const handleDeleteCoupon = (code) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  const handleTogglePackage = (id) => {
    setPackages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, active: !p.active };
      }
      return p;
    }));
  };

  // Filtered transactions
  const filteredTxns = txns.filter(t => {
    return t.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
           t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gói & Thanh Toán</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch sử giao dịch nạp tiền, điều chỉnh giá bán các gói dịch vụ và tạo mã giảm giá.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-8 gap-6 text-sm font-semibold text-slate-400">
          <button 
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 relative transition-colors ${activeTab === "transactions" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
          >
            Lịch Sử Giao Dịch
            {activeTab === "transactions" && (
              <motion.div layoutId="paymentTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("packages")}
            className={`pb-3 relative transition-colors ${activeTab === "packages" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
          >
            Cấu Hình Giá Gói
            {activeTab === "packages" && (
              <motion.div layoutId="paymentTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 relative transition-colors ${activeTab === "coupons" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
          >
            Mã Giảm Giá (Coupons)
            {activeTab === "coupons" && (
              <motion.div layoutId="paymentTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {activeTab === "transactions" && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search Toolbar */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm mã giao dịch hoặc khách hàng..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Mã GD</th>
                        <th className="px-6 py-4">Khách Hàng</th>
                        <th className="px-6 py-4">Gói Dịch Vụ</th>
                        <th className="px-6 py-4">Số Tiền</th>
                        <th className="px-6 py-4">Thời Gian</th>
                        <th className="px-6 py-4 text-right">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                      {filteredTxns.length > 0 ? (
                        filteredTxns.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">
                              {txn.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{txn.user}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">{txn.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                              {txn.package}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-800">
                              {txn.amount.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                              {txn.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                txn.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                              }`}>
                                {txn.status === "Success" ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    Thành Công
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-500" />
                                    Thất Bại
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-400 font-medium text-xs">
                            Không tìm thấy giao dịch nào!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "packages" && (
            <motion.div 
              key="packages"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {packages.map(pkg => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group ${
                    pkg.active ? "border-slate-100" : "border-slate-200 bg-slate-50/50 opacity-75"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.user === "Candidate" ? "bg-sky-50 text-[#0ea5e9]" : "bg-amber-50 text-amber-700"
                      }`}>
                        Dành cho {pkg.user === "Candidate" ? "Candidate" : "HR/Doanh nghiệp"}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${pkg.active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">{pkg.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mb-6">Mã gói: {pkg.id} • Thời hạn: {pkg.duration}</p>

                    <div className="text-2xl font-extrabold text-slate-950 mb-2">
                      {pkg.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 border-t border-slate-50 pt-4">
                    <button className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      Sửa Giá
                    </button>
                    
                    <button 
                      onClick={() => handleTogglePackage(pkg.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        pkg.active ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {pkg.active ? "Tắt gói" : "Bật gói"}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "coupons" && (
            <motion.div 
              key="coupons"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Add Coupon Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm flex flex-col justify-between shrink-0 h-fit">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-[#0ea5e9]" />
                  Tạo Mã Giảm Giá Mới
                </h3>
                
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mã Coupon</label>
                    <input 
                      type="text" 
                      placeholder="VD: MOCKAI50" 
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ giảm (%)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        placeholder="VD: 50" 
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Ngày hết hạn</label>
                      <input 
                        type="date" 
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0ea5e9] text-slate-700"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm shadow-sky-100 flex items-center justify-center gap-1.5 active:scale-98 transition-all mt-4 outline-none"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Mã Giảm Giá
                  </button>
                </form>
              </div>

              {/* Coupon Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {coupons.map(coupon => (
                    <motion.div 
                      key={coupon.code}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-sky-50 text-[#0ea5e9] rounded-xl">
                          <Percent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 tracking-wider font-mono">{coupon.code}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Giảm {coupon.discount}% • HSD: {coupon.expiry}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-90 transition-colors"
                        title="Xóa mã"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
