
import { lazy } from "react";
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ManageUsers = lazy(() => import("../pages/admin/ManageUsers").then(m => ({ default: m.ManageUsers })));
const ManageCompanies = lazy(() => import("../pages/admin/ManageCompanies").then(m => ({ default: m.ManageCompanies })));
const ManageJobPosts = lazy(() => import("../pages/admin/ManageJobPosts").then(m => ({ default: m.ManageJobPosts })));
const ManageBlog = lazy(() => import("../pages/admin/ManageBlog").then(m => ({ default: m.ManageBlog })));
const ManageReports = lazy(() => import("../pages/admin/ManageReports").then(m => ({ default: m.ManageReports })));
const ManagePayments = lazy(() => import("../pages/admin/ManagePayments").then(m => ({ default: m.ManagePayments })));
const AISettings = lazy(() => import("../pages/admin/AISettings").then(m => ({ default: m.AISettings })));
const SystemSettings = lazy(() => import("../pages/admin/SystemSettings").then(m => ({ default: m.SystemSettings })));
const RolePermissions = lazy(() => import("../pages/admin/RolePermissions").then(m => ({ default: m.RolePermissions })));

import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export const adminRoutes = [
  { 
    index: true, 
    element: <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
  },
  { 
    path: "users", 
    element: <ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>
  },
  { 
    path: "companies", 
    element: <ProtectedRoute requiredRole="admin"><ManageCompanies /></ProtectedRoute>
  },
  { 
    path: "jobs", 
    element: <ProtectedRoute requiredRole="admin"><ManageJobPosts /></ProtectedRoute>
  },
  { 
    path: "blog", 
    element: <ProtectedRoute requiredRole="admin"><ManageBlog /></ProtectedRoute>
  },
  { 
    path: "reports", 
    element: <ProtectedRoute requiredRole="admin"><ManageReports /></ProtectedRoute>
  },
  { 
    path: "payments", 
    element: <ProtectedRoute requiredRole="admin"><ManagePayments /></ProtectedRoute>
  },
  { 
    path: "ai-settings", 
    element: <ProtectedRoute requiredRole="admin"><AISettings /></ProtectedRoute>
  },
  { 
    path: "system-settings", 
    element: <ProtectedRoute requiredRole="admin"><SystemSettings /></ProtectedRoute>
  },
  { 
    path: "permissions", 
    element: <ProtectedRoute requiredRole="admin"><RolePermissions /></ProtectedRoute>
  },
];
