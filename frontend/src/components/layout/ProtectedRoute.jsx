import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Chưa đăng nhập thì đẩy về /
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Đã đăng nhập nhưng không đủ quyền thì đẩy về /
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
