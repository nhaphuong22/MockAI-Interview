import { HRDashboard } from "../pages/recruiter/HRDashboard";
import { PostJob } from "../pages/recruiter/PostJob";
import { EditJob } from "../pages/recruiter/EditJob";
import { ManageJobs } from "../pages/recruiter/ManageJobs";
import { ManageApplications } from "../pages/recruiter/ManageApplications";
import { CandidateProfile } from "../pages/recruiter/CandidateProfile";
import { CompanyProfile } from "../pages/recruiter/CompanyProfile";
import { RecruitmentAnalytics } from "../pages/recruiter/RecruitmentAnalytics";
import { CampaignAnalytics } from "../pages/recruiter/CampaignAnalytics";
import { CompanySettings } from "../pages/recruiter/CompanySettings";
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
    path: "analytics", 
    element: <ProtectedRoute requiredRole="hr"><RecruitmentAnalytics /></ProtectedRoute>
  },
  { 
    path: "campaign/:jobId", 
    element: <ProtectedRoute requiredRole="hr"><CampaignAnalytics /></ProtectedRoute>
  },
  { 
    path: "settings", 
    element: <ProtectedRoute requiredRole="hr"><CompanySettings /></ProtectedRoute>
  },
  { 
    path: "notifications", 
    element: <ProtectedRoute requiredRole="hr"><RecruiterNotifications /></ProtectedRoute>
  },
];
