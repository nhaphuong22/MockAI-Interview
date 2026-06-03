import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Payment } from "./pages/shared/Payment";
import { PaymentSuccess } from "./pages/shared/PaymentSuccess";
import { VerifyEmail } from "./pages/shared/VerifyEmail";
import { ResetPassword } from "./pages/shared/ResetPassword";

// Candidate Pages (Ứng viên)
import { Home } from "./pages/candidate/Home";
import { Jobs } from "./pages/candidate/Jobs";
import { JobDetail } from "./pages/candidate/JobDetail";
import { SavedJobs } from "./pages/candidate/SavedJobs";
import { ApplicationTracking } from "./pages/candidate/ApplicationTracking";
import { Profile } from "./pages/candidate/Profile";
import { CVReview } from "./pages/candidate/CVReview";
import { InterviewPractice } from "./pages/candidate/InterviewPractice";
import { Community } from "./pages/candidate/Community";
import { SavedCompanies } from "./pages/candidate/SavedCompanies";
import { Notifications } from "./pages/candidate/Notifications";
import { Settings } from "./pages/candidate/Settings";

// Recruiter Pages (Nhà Tuyển Dụng)
import { HRDashboard } from "./pages/recruiter/HRDashboard";
import { PostJob } from "./pages/recruiter/PostJob";
import { EditJob } from "./pages/recruiter/EditJob";
import { ManageJobs } from "./pages/recruiter/ManageJobs";
import { ManageApplications } from "./pages/recruiter/ManageApplications";
import { CandidateProfile } from "./pages/recruiter/CandidateProfile";
import { CompanyProfile } from "./pages/recruiter/CompanyProfile";
import { RecruitmentAnalytics } from "./pages/recruiter/RecruitmentAnalytics";
import { CompanySettings } from "./pages/recruiter/CompanySettings";
import { RecruiterNotifications } from "./pages/recruiter/HRNotifications";

// Administrator Pages (Quản trị viên)
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageUsers } from "./pages/admin/ManageUsers";
import { ManageCompanies } from "./pages/admin/ManageCompanies";
import { ManageJobPosts } from "./pages/admin/ManageJobPosts";
import { ManageBlog } from "./pages/admin/ManageBlog";
import { ManagePayments } from "./pages/admin/ManagePayments";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AISettings } from "./pages/admin/AISettings";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { RolePermissions } from "./pages/admin/RolePermissions";

export const router = createBrowserRouter([
  // Candidate Routes (Trang chủ)
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home }, // Public: Landing Page
      { 
        path: "jobs", 
        element: <ProtectedRoute><Jobs /></ProtectedRoute>
      },
      { 
        path: "jobs/:id", 
        element: <ProtectedRoute><JobDetail /></ProtectedRoute>
      },
      { 
        path: "saved-jobs", 
        element: <ProtectedRoute><SavedJobs /></ProtectedRoute>
      },
      { 
        path: "applications", 
        element: <ProtectedRoute><ApplicationTracking /></ProtectedRoute>
      },
      { 
        path: "profile", 
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      { 
        path: "cv-review", 
        element: <ProtectedRoute><CVReview /></ProtectedRoute>
      },
      { 
        path: "interview-practice", 
        element: <ProtectedRoute><InterviewPractice /></ProtectedRoute>
      },
      { 
        path: "community", 
        element: <ProtectedRoute><Community /></ProtectedRoute>
      },
      { 
        path: "saved-companies", 
        element: <ProtectedRoute><SavedCompanies /></ProtectedRoute>
      },
      { 
        path: "notifications", 
        element: <ProtectedRoute><Notifications /></ProtectedRoute>
      },
      { 
        path: "settings", 
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      },
      { 
        path: "payment", 
        element: <ProtectedRoute><Payment /></ProtectedRoute>
      },
      { 
        path: "payment-success", 
        element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
      },
    ],
  },

  // Recruiter Dashboard (Sau đăng nhập tại /hr)
  {
    path: "/hr/dashboard",
    Component: Layout,
    children: [

      { index: true, Component: HRDashboard },
      { path: "post-job", Component: PostJob },
      { path: "edit-job/:id", Component: EditJob },
      { path: "manage-jobs", Component: ManageJobs },
      { path: "applications", Component: ManageApplications },
      { path: "candidate/:id", Component: CandidateProfile },
      { path: "company-profile", Component: CompanyProfile },
      { path: "analytics", Component: RecruitmentAnalytics },
      { path: "settings", Component: CompanySettings },
      { path: "notifications", Component: RecruiterNotifications },

      { 
        index: true, 
        element: <ProtectedRoute requiredRole="hr"><HRDashboard /></ProtectedRoute>
      },
      { 
        path: "post-job", 
        element: <ProtectedRoute requiredRole="hr"><PostJob /></ProtectedRoute>
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
        path: "settings", 
        element: <ProtectedRoute requiredRole="hr"><CompanySettings /></ProtectedRoute>
      },
      { 
        path: "notifications", 
        element: <ProtectedRoute requiredRole="hr"><RecruiterNotifications /></ProtectedRoute>
      },

    ],
  },

  // Administrator Dashboard (Sau đăng nhập tại /admin)
  {
    path: "/admin/dashboard",
    Component: Layout,
    children: [
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
      { 
        path: "permissions", 
        element: <ProtectedRoute requiredRole="admin"><RolePermissions /></ProtectedRoute>
      },
    ],
  },

  // Auth standalone pages (no Layout wrapper)
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/reset-password", Component: ResetPassword },
]);
