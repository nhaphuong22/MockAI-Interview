import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { ManageUsers } from "../pages/admin/ManageUsers";
import { ManageCompanies } from "../pages/admin/ManageCompanies";
import { ManageJobPosts } from "../pages/admin/ManageJobPosts";
import { ManageBlog } from "../pages/admin/ManageBlog";
import { ManagePayments } from "../pages/admin/ManagePayments";
import { AdminAnalytics } from "../pages/admin/AdminAnalytics";
import { AISettings } from "../pages/admin/AISettings";
import { SystemSettings } from "../pages/admin/SystemSettings";
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
    path: "analytics", 
    element: <ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>
  },
  { 
    path: "ai-settings", 
    element: <ProtectedRoute requiredRole="admin"><AISettings /></ProtectedRoute>
  },
  { 
    path: "system-settings", 
    element: <ProtectedRoute requiredRole="admin"><SystemSettings /></ProtectedRoute>
  },
];
