import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { ManageUsers } from "../pages/admin/ManageUsers";
import { ManageCompanies } from "../pages/admin/ManageCompanies";
import { ManageJobPosts } from "../pages/admin/ManageJobPosts";
import { ManageBlog } from "../pages/admin/ManageBlog";
import { ManagePayments } from "../pages/admin/ManagePayments";
import { AISettings } from "../pages/admin/AISettings";
import { SystemSettings } from "../pages/admin/SystemSettings";
import { RolePermissions } from "../pages/admin/RolePermissions";
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
