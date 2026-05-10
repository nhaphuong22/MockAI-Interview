import React from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart2, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/useAuthStore';

const menuItems = [
  { icon: <BarChart2 size={20} />, label: 'Dashboard', active: true },
  { icon: <Users size={20} />, label: 'Users Management' },
  { icon: <BookOpen size={20} />, label: 'Question Bank' },
  { icon: <Settings size={20} />, label: 'Settings' },
];

export default function AdminDashboard() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Admin<span className="text-primary">Portal</span>
          </span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                item.active 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8">
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 w-96">
            <Search className="text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none ml-2 w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.full_name || 'System Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@mockai.com'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
          </div>

          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Total Users", value: "1,248", trend: "+12%", color: "text-blue-500" },
              { title: "Interviews Conducted", value: "3,842", trend: "+24%", color: "text-emerald-500" },
              { title: "Question Bank Size", value: "856", trend: "+5%", color: "text-primary" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-gray-500 font-medium mb-2">{stat.title}</h3>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  <span className={`text-sm font-medium ${stat.color}`}>{stat.trend} this week</span>
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder for Charts / Tables */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 h-96 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Analytics Chart Placeholder</p>
          </div>
        </div>
      </main>
    </div>
  );
}
