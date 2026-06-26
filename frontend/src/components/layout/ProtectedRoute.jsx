import { useEffect, useState } from 'react';
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

  // Lưu trạng thái xác thực ban đầu để phân biệt với hành động Đăng xuất
  const [wasAuthenticated] = useState(isAuthenticated);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      // Chỉ hiện thông báo nếu user vào trang khi CHƯA đăng nhập
      // Nếu wasAuthenticated = true tức là họ mới bấm Đăng xuất, thì không hiện Toast nữa
      if (!wasAuthenticated) {
        addToast('Yêu cầu đăng nhập để dùng được tính năng này', 'warning');
      }
      navigate('/', { replace: true });
      return;
    }

    // Check role if required
    if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
      addToast('Bạn không có quyền truy cập trang này', 'error');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, location.pathname, navigate, addToast, wasAuthenticated]);

  // Only render children if authenticated (and has correct role if required)
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return null;
  }

  return children;
}

