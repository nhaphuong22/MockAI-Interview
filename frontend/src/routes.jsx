import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
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

export const router = createBrowserRouter([
  // Candidate Routes (Trang chủ)
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "jobs", Component: Jobs },
      { path: "jobs/:id", Component: JobDetail },
      { path: "saved-jobs", Component: SavedJobs },
      { path: "applications", Component: ApplicationTracking },
      { path: "profile", Component: Profile },
      { path: "cv-review", Component: CVReview },
      { path: "interview-practice", Component: InterviewPractice },
      { path: "community", Component: Community },
      { path: "saved-companies", Component: SavedCompanies },
      { path: "notifications", Component: Notifications },
      { path: "settings", Component: Settings },
      { path: "payment", Component: Payment },
      { path: "payment-success", Component: PaymentSuccess },
    ],
  },

  // Recruiter Dashboard (Sau đăng nhập tại /hr)
  {
    path: "/hr/dashboard",
    Component: Layout,
    children: [
      { index: true, Component: HRDashboard },
      { path: "post-job", Component: PostJob },
      { path: "manage-jobs", Component: ManageJobs },
      { path: "applications", Component: ManageApplications },
      { path: "candidate/:id", Component: CandidateProfile },
      { path: "company-profile", Component: CompanyProfile },
      { path: "analytics", Component: RecruitmentAnalytics },
      { path: "settings", Component: CompanySettings },
      { path: "notifications", Component: RecruiterNotifications },
    ],
  },

  // Administrator Dashboard (Sau đăng nhập tại /admin)
  {
    path: "/admin/dashboard",
    Component: Layout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: ManageUsers },
      { path: "companies", Component: ManageCompanies },
      { path: "jobs", Component: ManageJobPosts },
      { path: "blog", Component: ManageBlog },
      { path: "payments", Component: ManagePayments },
      { path: "analytics", Component: AdminAnalytics },
      { path: "ai-settings", Component: AISettings },
      { path: "system-settings", Component: SystemSettings },
    ],
  },

  // Auth standalone pages (no Layout wrapper)
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/reset-password", Component: ResetPassword },
]);
