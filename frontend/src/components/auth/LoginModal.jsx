import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bot, LogIn, Loader2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/useAuthStore';
import { cn } from '../../utils/cn';

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  
  const savedEmail = localStorage.getItem('saved_email') || '';
  const [formData, setFormData] = useState({ email: savedEmail, password: '' });
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFormData(prev => ({ ...prev, password: '' }));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/api/auth/login', formData);

      if (response.data.success) {
        if (rememberMe) {
          localStorage.setItem('saved_email', formData.email);
        } else {
          localStorage.removeItem('saved_email');
        }

        const { user, token } = response.data.data;
        loginAction(user, token);
        
        onClose(); // Đóng modal

        // Điều hướng dựa trên role
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm mt-2 text-center">
                Please enter your details to sign in
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all"
                  placeholder="admin@mockai.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button type="button" className="text-sm font-medium text-primary hover:text-secondary transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all",
                  isLoading 
                    ? "bg-primary/70 cursor-not-allowed" 
                    : "bg-primary hover:bg-secondary shadow-lg shadow-primary/30"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
