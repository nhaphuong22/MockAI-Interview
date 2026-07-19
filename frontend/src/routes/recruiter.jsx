import { lazy } from "react";
import { Navigate } from "react-router-dom";
const HRDashboard = lazy(() => import("../pages/recruiter/HRDashboard").then(m => ({ default: m.HRDashboard })));
const PostJob = lazy(() => import("../pages/recruiter/PostJob").then(m => ({ default: m.PostJob })));
const EditJob = lazy(() => import("../pages/recruiter/EditJob").then(m => ({ default: m.EditJob })));
const Packages = lazy(() => import("../pages/shared/Packages").then(m => ({ default: m.Packages })));
const Checkout = lazy(() => import("../pages/shared/Checkout").then(m => ({ default: m.Checkout })));
const ManageJobs = lazy(() => import("../pages/recruiter/ManageJobs").then(m => ({ default: m.ManageJobs })));
const ManageApplications = lazy(() => import("../pages/recruiter/ManageApplications").then(m => ({ default: m.ManageApplications })));
const ShortlistBoard = lazy(() => import("../pages/recruiter/ShortlistBoard").then(m => ({ default: m.ShortlistBoard })));
const CandidateProfile = lazy(() => import("../pages/recruiter/CandidateProfile").then(m => ({ default: m.CandidateProfile })));
const CompanyProfile = lazy(() => import("../pages/recruiter/CompanyProfile").then(m => ({ default: m.CompanyProfile })));
const HRVerificationSettings = lazy(() => import("../pages/recruiter/HRVerificationSettings").then(m => ({ default: m.HRVerificationSettings })));
const RecruiterNotifications = lazy(() => import("../pages/recruiter/HRNotifications").then(m => ({ default: m.RecruiterNotifications })));
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export const recruiterRoutes = [
  { 
    index: true, 
    element: <ProtectedRoute requiredRole="hr"><HRDashboard /></ProtectedRoute>
  },

  { 
    path: "post-job", 
    element: <ProtectedRoute requiredRole="hr"><PostJob /></ProtectedRoute>
  },
  { 
    path: "company-setup", 
    element: <ProtectedRoute requiredRole="hr"><HRVerificationSettings /></ProtectedRoute>
  },
  { 
    path: "edit-job/:id", 
    element: <ProtectedRoute requiredRole="hr"><EditJob /></ProtectedRoute>
  },
  { 
    path: "packages", 
    element: <ProtectedRoute requiredRole="hr"><Packages /></ProtectedRoute>
  },
  { 
    path: "checkout/:id", 
    element: <ProtectedRoute requiredRole="hr"><Checkout /></ProtectedRoute>
  },
  { 
    path: "manage-jobs", 
    element: <ProtectedRoute requiredRole="hr"><ManageJobs /></ProtectedRoute>
  },
  { 
    path: "applications", 
    element: <ProtectedRoute requiredRole="hr"><ManageApplications /></ProtectedRoute>
  },
  { 
    path: "candidate/:id", 
    element: <ProtectedRoute requiredRole="hr"><CandidateProfile /></ProtectedRoute>
  },
  { 
    path: "company-profile", 
    element: <ProtectedRoute requiredRole="hr"><CompanyProfile /></ProtectedRoute>
  },
  { 
    path: "settings", 
    element: <ProtectedRoute requiredRole="hr"><HRVerificationSettings /></ProtectedRoute>
  },
  { 
    path: "notifications", 
    element: <ProtectedRoute requiredRole="hr"><RecruiterNotifications /></ProtectedRoute>
  },
  { 
    path: "shortlist", 
    element: <ProtectedRoute requiredRole="hr"><ShortlistBoard /></ProtectedRoute>
  },
  {
    path: "*",
    element: <Navigate to="/hr/dashboard" replace />
  }
];
