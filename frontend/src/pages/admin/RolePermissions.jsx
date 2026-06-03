import { useState, useEffect } from "react";
import {
  ShieldCheck, Save, RotateCcw, Lock, CheckCircle2,
  XCircle, AlertTriangle, Loader2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { getPermissionsMatrix, updateRolePermissions } from "../../api/adminApi";

// Ánh xạ tên DB → tên hiển thị tiếng Việt
const ROLE_LABELS = {
  ADMIN: { label: "Quản Trị Viên", color: "from-rose-500 to-red-600", badge: "bg-red-100 text-red-700", icon: "👑" },
  HR:    { label: "Nhà Tuyển Dụng", color: "from-sky-500 to-blue-600", badge: "bg-sky-100 text-sky-700", icon: "🏢" },
  USER:  { label: "Ứng Viên",      color: "from-emerald-500 to-green-600", badge: "bg-emerald-100 text-emerald-700", icon: "👤" },
};

const PERM_GROUP = {
  "cv":          { label: "📄 Hồ Sơ CV", color: "bg-violet-50 border-violet-200" },
  "interview":   { label: "🎤 Phỏng Vấn", color: "bg-blue-50 border-blue-200" },
  "job":         { label: "💼 Tin Tuyển Dụng", color: "bg-amber-50 border-amber-200" },
  "application": { label: "📋 Đơn Ứng Tuyển", color: "bg-orange-50 border-orange-200" },
  "message":     { label: "💬 Nhắn Tin", color: "bg-teal-50 border-teal-200" },
  "candidate":   { label: "🔍 Ứng Viên", color: "bg-pink-50 border-pink-200" },
  "user":        { label: "👥 Người Dùng", color: "bg-indigo-50 border-indigo-200" },
  "analytics":   { label: "📊 Thống Kê", color: "bg-emerald-50 border-emerald-200" },
  "system":      { label: "⚙️ Hệ Thống", color: "bg-slate-50 border-slate-200" },
};

const getPermGroup = (permName) => {
  const prefix = permName.split(":")[0];
  return PERM_GROUP[prefix] || { label: prefix, color: "bg-gray-50 border-gray-200" };
};

export function RolePermissions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // roleId đang lưu
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Dữ liệu từ API
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState({}); // { roleId: Set(permId) }
  const [originalMatrix, setOriginalMatrix] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPermissionsMatrix();
      if (res && res.success) {
        const { roles: r, permissions: p, rolePermissionsMap } = res.data;
        setRoles(r);
        setPermissions(p);

        // Chuyển arrays thành Sets để toggle nhanh hơn O(1)
        const matrixSets = {};
        r.forEach(role => {
          matrixSets[role.id] = new Set(rolePermissionsMap[role.id] || []);
        });
        setMatrix(matrixSets);
        // Lưu bản gốc để reset
        setOriginalMatrix(JSON.parse(JSON.stringify(
          Object.fromEntries(Object.entries(matrixSets).map(([k, v]) => [k, [...v]]))
        )));
      } else {
        setError("Không thể tải dữ liệu ma trận phân quyền.");
      }
    } catch (err) {
      console.error("Lỗi khi tải ma trận phân quyền:", err);
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle một checkbox trong matrix (chỉ cho phép với non-ADMIN)
  const handleToggle = (roleId, permId, roleName) => {
    if (roleName === "ADMIN") return; // ADMIN luôn có full quyền
    setMatrix(prev => {
      const newMatrix = { ...prev };
      const roleSet = new Set(newMatrix[roleId]);
      if (roleSet.has(permId)) {
        roleSet.delete(permId);
      } else {
        roleSet.add(permId);
      }
      newMatrix[roleId] = roleSet;
      return newMatrix;
    });
  };

  // Lưu thay đổi cho một role cụ thể
  const handleSaveRole = async (roleId) => {
    setSaving(roleId);
    try {
      const permissionIds = [...matrix[roleId]];
      const res = await updateRolePermissions(roleId, permissionIds);
      if (res && res.success) {
        // Cập nhật original matrix sau khi lưu thành công
        setOriginalMatrix(prev => ({
          ...prev,
          [roleId]: permissionIds
        }));
        showToast("Cập nhật quyền hạn thành công!", "success");
      } else {
        showToast("Cập nhật thất bại. Vui lòng thử lại.", "error");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi lưu quyền hạn.";
      showToast(msg, "error");
    } finally {
      setSaving(null);
    }
  };

  // Reset về trạng thái ban đầu cho một role
  const handleResetRole = (roleId) => {
    setMatrix(prev => ({
      ...prev,
      [roleId]: new Set(originalMatrix[roleId] || [])
    }));
  };

  // Kiểm tra xem role có thay đổi chưa
  const hasChanged = (roleId) => {
    const orig = new Set(originalMatrix[roleId] || []);
    const curr = matrix[roleId] || new Set();
    if (orig.size !== curr.size) return true;
    for (const id of orig) {
      if (!curr.has(id)) return true;
    }
    return false;
  };

  // Nhóm permissions theo prefix
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const prefix = perm.name.split(":")[0];
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(perm);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mx-auto" />
            <p className="text-slate-500 font-medium">Đang tải ma trận phân quyền...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <p className="text-slate-600 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-medium hover:bg-sky-600 transition"
            >
              Thử Lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#0ea5e9] to-blue-600 rounded-xl shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Phân Quyền Hệ Thống</h1>
              <p className="text-sm text-slate-500">Cấu hình quyền truy cập cho từng vai trò người dùng</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
            <Info className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
            <p className="text-sm text-sky-700">
              Vai trò <strong>Quản Trị Viên</strong> luôn có toàn bộ quyền hạn và không thể thay đổi.
              Tick vào ô checkbox để cấp hoặc thu hồi quyền cho từng vai trò, sau đó nhấn <strong>Lưu</strong>.
            </p>
          </div>

          {/* Permissions Matrix — một card cho mỗi role */}
          {roles.map(role => {
            const roleInfo = ROLE_LABELS[role.name] || { label: role.name, color: "from-slate-500 to-slate-600", badge: "bg-slate-100 text-slate-700", icon: "🔒" };
            const isAdmin = role.name === "ADMIN";
            const changed = !isAdmin && hasChanged(role.id);

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isAdmin ? "border-rose-200" : "border-slate-200"}`}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${roleInfo.color} px-6 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{roleInfo.icon}</span>
                    <div>
                      <h2 className="text-white font-bold text-lg">{roleInfo.label}</h2>
                      <p className="text-white/70 text-sm">
                        {isAdmin
                          ? "Toàn quyền hệ thống — không thể chỉnh sửa"
                          : `${matrix[role.id]?.size || 0} / ${permissions.length} quyền được cấp`}
                      </p>
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="flex items-center gap-2">
                      {changed && (
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium">
                          Có thay đổi
                        </span>
                      )}
                      <button
                        onClick={() => handleResetRole(role.id)}
                        disabled={!changed}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Đặt Lại
                      </button>
                      <button
                        onClick={() => handleSaveRole(role.id)}
                        disabled={!changed || saving === role.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold shadow transition"
                      >
                        {saving === role.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Lưu
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
                      <Lock className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Khóa Chỉnh Sửa</span>
                    </div>
                  )}
                </div>

                {/* Permission Groups Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(groupedPermissions).map(([prefix, perms]) => {
                    const group = getPermGroup(perms[0].name);
                    return (
                      <div key={prefix} className={`rounded-xl border p-4 space-y-2.5 ${group.color}`}>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{group.label}</p>
                        {perms.map(perm => {
                          const checked = isAdmin || (matrix[role.id]?.has(perm.id) || false);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-3 cursor-pointer group ${isAdmin ? "cursor-default" : ""}`}
                              onClick={() => handleToggle(role.id, perm.id, role.name)}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                checked
                                  ? "bg-[#0ea5e9] border-[#0ea5e9]"
                                  : "bg-white border-slate-300 group-hover:border-[#0ea5e9]"
                              } ${isAdmin ? "opacity-70" : ""}`}>
                                {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-medium leading-tight ${checked ? "text-slate-800" : "text-slate-500"}`}>
                                  {perm.name}
                                </p>
                                {perm.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{perm.description}</p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl font-medium text-sm ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircle2 className="w-5 h-5" />
              : <XCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
