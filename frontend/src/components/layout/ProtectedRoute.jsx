import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';

/**
 * ProtectedRoute Component
 * Blocks access to protected pages and shows Toast for unauthenticated users
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const addToast = useUiStore((state) => state.addToast);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      addToast('Yêu cầu đăng nhập để dùng được tính năng này', 'warning');
      navigate('/', { replace: true });
      return;
    }

    // Check role if required
    if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
      addToast('Bạn không có quyền truy cập trang này', 'error');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, location.pathname, navigate, addToast]);

  // Only render children if authenticated (and has correct role if required)
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return null;
  }

  return children;
}

