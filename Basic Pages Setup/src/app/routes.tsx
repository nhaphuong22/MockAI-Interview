import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/shared/Login";
import { Register } from "./pages/shared/Register";

// Luồng A - Job Seeker
import { Home } from "./pages/jobseeker/Home";
import { Jobs } from "./pages/jobseeker/Jobs";
import { JobDetail } from "./pages/jobseeker/JobDetail";
import { SavedJobs } from "./pages/jobseeker/SavedJobs";
import { ApplicationTracking } from "./pages/jobseeker/ApplicationTracking";
import { Profile } from "./pages/jobseeker/Profile";
import { CVReview } from "./pages/jobseeker/CVReview";
import { InterviewPractice } from "./pages/jobseeker/InterviewPractice";
import { Community } from "./pages/jobseeker/Community";
import { SavedCompanies } from "./pages/jobseeker/SavedCompanies";
import { Notifications } from "./pages/jobseeker/Notifications";
import { Settings } from "./pages/jobseeker/Settings";

// Luồng B - HR/Recruiter
import { HRDashboard } from "./pages/hr/HRDashboard";
import { PostJob } from "./pages/hr/PostJob";
import { ManageJobs } from "./pages/hr/ManageJobs";
import { ManageApplications } from "./pages/hr/ManageApplications";
import { CandidateProfile } from "./pages/hr/CandidateProfile";
import { CompanyProfile } from "./pages/hr/CompanyProfile";
import { RecruitmentAnalytics } from "./pages/hr/RecruitmentAnalytics";
import { CompanySettings } from "./pages/hr/CompanySettings";
import { HRNotifications } from "./pages/hr/HRNotifications";

// Luồng C - Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageUsers } from "./pages/admin/ManageUsers";
import { ManageCompanies } from "./pages/admin/ManageCompanies";
import { ManageJobPosts } from "./pages/admin/ManageJobPosts";
import { ManageBlog } from "./pages/admin/ManageBlog";
import { ManagePayments } from "./pages/admin/ManagePayments";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AISettings } from "./pages/admin/AISettings";
import { SystemSettings } from "./pages/admin/SystemSettings";

// Shared
import { Payment } from "./pages/shared/Payment";
import { PaymentSuccess } from "./pages/shared/PaymentSuccess";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },

  // Job Seeker Routes
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

  // HR/Recruiter Routes
  {
    path: "/hr",
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
      { path: "notifications", Component: HRNotifications },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
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
]);
