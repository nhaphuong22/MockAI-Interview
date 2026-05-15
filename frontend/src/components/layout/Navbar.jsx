import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/useAuthStore';
import LoginModal from '../auth/LoginModal';
import ShinyText from '../ui/ShinyText';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">
              <ShinyText
                text="MockAI"
                color="#ffffff"
                shineColor="#007ffb"
                speed={3}
                className="font-bold"
              />
              <ShinyText
                text="Interview"
                color="#007ffb"
                shineColor="#ffffff"
                speed={3}
                className="font-bold"
              />
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium px-3 py-2 transition-colors">
              Features
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium px-3 py-2 transition-colors">
              Pricing
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-full font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className={cn(
                  "flex items-center gap-2",
                  "bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-primary/30"
                )}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
}
