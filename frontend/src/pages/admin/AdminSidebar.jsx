import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Cpu, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Tổng Quan",
      icon: LayoutDashboard
    },
    {
      path: "/admin/dashboard/users",
      label: "Người Dùng",
      icon: Users
    },
    {
      path: "/admin/dashboard/companies",
      label: "Doanh Nghiệp",
      icon: Building
    },
    {
      path: "/admin/dashboard/jobs",
      label: "Tin Đăng Tuyển",
      icon: Briefcase
    },
    {
      path: "/admin/dashboard/blog",
      label: "Kiểm Duyệt Blog",
      icon: FileText
    },
    {
      path: "/admin/dashboard/payments",
      label: "Gói & Thanh Toán",
      icon: CreditCard
    },
    {
      path: "/admin/dashboard/ai-settings",
      label: "Cấu Hình AI",
      icon: Cpu
    },
    {
      path: "/admin/dashboard/system-settings",
      label: "Cài Đặt Hệ Thống",
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col justify-between py-6 px-4 shadow-sm shrink-0">
      <div className="space-y-6">
        <div className="px-3 flex items-center gap-2.5 text-[#0ea5e9]">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-bold tracking-wide uppercase text-xs">Admin Control Center</span>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-sky-50/70 border-l-4 border-[#0ea5e9] rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-[#0ea5e9]' : 'text-slate-500 group-hover:text-[#0ea5e9]'}`} />
                <span className={`relative z-10 transition-colors ${isActive ? 'text-[#0ea5e9] font-semibold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 px-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0ea5e9] flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Administrator</p>
            <p className="text-[10px] text-slate-400">admin@mockai.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
