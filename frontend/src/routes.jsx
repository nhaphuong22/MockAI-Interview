import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/shared/Login";
import { Register } from "./pages/shared/Register";
import { Payment } from "./pages/shared/Payment";
import { PaymentSuccess } from "./pages/shared/PaymentSuccess";

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
import { AdminDashboard } from "./pages/administrator/AdminDashboard";
import { ManageUsers } from "./pages/administrator/ManageUsers";
import { ManageCompanies } from "./pages/administrator/ManageCompanies";
import { ManageJobPosts } from "./pages/administrator/ManageJobPosts";
import { ManageBlog } from "./pages/administrator/ManageBlog";
import { ManagePayments } from "./pages/administrator/ManagePayments";
import { AdminAnalytics } from "./pages/administrator/AdminAnalytics";
import { AISettings } from "./pages/administrator/AISettings";
import { SystemSettings } from "./pages/administrator/SystemSettings";

export const router = createBrowserRouter([
  // Tách biệt các link đăng nhập
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/hr",
    Component: Login, // HR/Recruiter Login
  },
  {
    path: "/admin",
    Component: Login, // Admin Login
  },

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
]);
