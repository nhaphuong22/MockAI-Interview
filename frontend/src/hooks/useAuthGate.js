import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';

/**
 * Custom hook for Auth Gate Protocol
 * Shows toast notification instead of opening Auth Modal
 */
export const useAuthGate = () => {
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useUiStore();

  /**
   * Check if user is authenticated before navigation
   * @param {string} targetPath - The intended destination path
   * @param {Function} callback - Optional callback to execute if authenticated
   * @returns {boolean} - Whether navigation should proceed
   */
  const checkAuth = useCallback((targetPath, callback) => {
    if (!isAuthenticated) {
      showToast({
        message: 'Yêu cầu đăng nhập để dùng được tính năng này',
        type: 'warning',
      });
      return false;
    }

    if (callback && typeof callback === 'function') {
      callback();
    }

    return true;
  }, [isAuthenticated, showToast]);

  /**
   * Protected navigation handler with toast notification
   * @param {Event} e - Click event
   * @param {string} path - Target path
   * @param {Function} navigate - React Router navigate function
   */
  const handleProtectedNav = useCallback((e, path, navigate) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showToast({
        message: 'Yêu cầu đăng nhập để dùng được tính năng này',
        type: 'warning',
      });
      return;
    }

    // Allow default navigation if authenticated
    if (navigate) {
      navigate(path);
    }
  }, [isAuthenticated, showToast]);

  return {
    isAuthenticated,
    checkAuth,
    handleProtectedNav,
  };
};
