import { useState } from "react";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  UserMinus, 
  Shield, 
  Calendar, 
  Award, 
  PhoneCall, 
  ChevronRight,
  MoreVertical,
  X,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { mockUsers as initialUsers } from "./mockAdminData";

export function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [banConfirmUser, setBanConfirmUser] = useState(null);

  // Toggle user status
  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === "Active" ? "Banned" : "Active";
        return { ...user, status: newStatus };
      }
      return user;
    }));
    setBanConfirmUser(null);
  };

  // Change user role
  const handleChangeRole = (userId, newRole) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    }));
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Người Dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tài khoản ứng viên, nhà tuyển dụng và phân quyền hệ thống.</p>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm tên hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase">Bộ lọc:</span>
            </div>
            
            {/* Role Filter */}
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-[#0ea5e9]"
            >
              <option value="All">Tất Cả Vai Trò</option>
              <option value="Candidate">Ứng Viên</option>
              <option value="Recruiter">Nhà Tuyển Dụng</option>
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-[#0ea5e9]"
            >
              <option value="All">Tất Cả Trạng Thái</option>
              <option value="Active">Đang Hoạt Động</option>
              <option value="Banned">Bị Khóa</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Thành Viên</th>
                  <th className="px-6 py-4">Vai Trò</th>
                  <th className="px-6 py-4">Ngày Tham Gia</th>
                  <th className="px-6 py-4">Đánh Giá AI</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{user.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === "Recruiter" 
                            ? "bg-amber-50 text-amber-700 border border-amber-100" 
                            : "bg-sky-50 text-[#0ea5e9] border border-sky-100"
                        }`}>
                          {user.role === "Recruiter" ? "Nhà Tuyển Dụng" : "Ứng Viên"}
                        </span>
                      </td>
                      {/* Join Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        {user.joinDate}
                      </td>
                      {/* AI Stats (CV score / practice count) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === "Candidate" ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-slate-800">{user.cvScore}</span>
                            <span className="text-slate-400">/ 100 ({user.interviewCount} phỏng vấn)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          user.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {user.status === "Active" ? "Đang Hoạt Động" : "Bị Khóa"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="text-slate-400 hover:text-[#0ea5e9] font-semibold text-xs px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                          >
                            Xem Chi Tiết
                          </button>
                          
                          {user.status === "Active" ? (
                            <button 
                              onClick={() => setBanConfirmUser(user)}
                              className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Khóa Tài Khoản"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(user.id)}
                              className="text-emerald-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Kích Hoạt Tài Khoản"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium text-xs">
                      Không tìm thấy thành viên phù hợp với bộ lọc!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              {/* Modal Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden relative z-10 p-6 flex flex-col gap-6"
              >
                {/* Close btn */}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute right-5 top-5 p-1 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name} 
                    className="w-16 h-16 rounded-2xl border border-slate-100 object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{selectedUser.email}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
                      selectedUser.role === "Recruiter" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-[#0ea5e9]"
                    }`}>
                      {selectedUser.role === "Recruiter" ? "Nhà Tuyển Dụng" : "Ứng Viên"}
                    </span>
                  </div>
                </div>

                {/* Info List */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400">Tham Gia</p>
                      <p className="text-slate-700 mt-0.5">{selectedUser.joinDate}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400">Tổng Đã Trả</p>
                      <p className="text-[#0ea5e9] mt-0.5">{selectedUser.totalPaid}</p>
                    </div>
                  </div>

                  {selectedUser.role === "Candidate" && (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#0ea5e9]" />
                        <div>
                          <p className="text-[10px] text-slate-400">Điểm CV Lần Đầu</p>
                          <p className="text-slate-700 mt-0.5">{selectedUser.cvScore} / 100</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-[10px] text-slate-400">Lượt Luyện Phỏng Vấn</p>
                          <p className="text-slate-700 mt-0.5">{selectedUser.interviewCount} buổi phỏng vấn</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions inside modal */}
                <div className="flex gap-2 justify-end border-t border-slate-100 pt-5 mt-2">
                  {selectedUser.role !== "Admin" && (
                    <select 
                      value={selectedUser.role}
                      onChange={(e) => {
                        handleChangeRole(selectedUser.id, e.target.value);
                        setSelectedUser(prev => ({ ...prev, role: e.target.value }));
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="Candidate">Gán Quyền: Candidate</option>
                      <option value="Recruiter">Gán Quyền: Recruiter</option>
                    </select>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (selectedUser.status === "Active") {
                        setBanConfirmUser(selectedUser);
                      } else {
                        handleToggleStatus(selectedUser.id);
                        setSelectedUser(prev => ({ ...prev, status: "Active" }));
                      }
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 ${
                      selectedUser.status === "Active" 
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-600" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                    }`}
                  >
                    {selectedUser.status === "Active" ? "Khóa Tài Khoản" : "Kích Hoạt"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Ban Confirm Dialog */}
        <AnimatePresence>
          {banConfirmUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setBanConfirmUser(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-xl border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserMinus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Khóa Tài Khoản?</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn khóa tài khoản của <strong>{banConfirmUser.name}</strong> ({banConfirmUser.email})? Họ sẽ không thể đăng nhập vào MockAI.
                </p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setBanConfirmUser(null)}
                    className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(banConfirmUser.id)}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-rose-200"
                  >
                    Đồng Ý Khóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
