import { Navigate } from "react-router-dom";
import { HRDashboard } from "../pages/recruiter/HRDashboard";
import { PostJob } from "../pages/recruiter/PostJob";
import { EditJob } from "../pages/recruiter/EditJob";
import { ManageJobs } from "../pages/recruiter/ManageJobs";
import { ManageApplications } from "../pages/recruiter/ManageApplications";
import { ShortlistBoard } from "../pages/recruiter/ShortlistBoard";
import { CandidateProfile } from "../pages/recruiter/CandidateProfile";
import { CompanyProfile } from "../pages/recruiter/CompanyProfile";
import { HRVerificationSettings } from "../pages/recruiter/HRVerificationSettings";
import { RecruiterNotifications } from "../pages/recruiter/HRNotifications";
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
