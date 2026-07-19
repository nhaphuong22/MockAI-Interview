import { lazy } from "react";
const Home = lazy(() => import("../pages/candidate/Home").then(m => ({ default: m.Home })));
const Jobs = lazy(() => import("../pages/candidate/Jobs").then(m => ({ default: m.Jobs })));
const JobDetail = lazy(() => import("../pages/candidate/JobDetail").then(m => ({ default: m.JobDetail })));
const CompanyDetail = lazy(() => import("../pages/candidate/CompanyDetail").then(m => ({ default: m.CompanyDetail })));
const SavedJobs = lazy(() => import("../pages/candidate/SavedJobs").then(m => ({ default: m.SavedJobs })));
const ApplicationTracking = lazy(() => import("../pages/candidate/ApplicationTracking").then(m => ({ default: m.ApplicationTracking })));
const Profile = lazy(() => import("../pages/candidate/Profile").then(m => ({ default: m.Profile })));
const CVReview = lazy(() => import("../pages/candidate/CVReview").then(m => ({ default: m.CVReview })));
const InterviewPractice = lazy(() => import("../pages/candidate/InterviewPractice").then(m => ({ default: m.InterviewPractice })));
const Community = lazy(() => import("../pages/candidate/Community").then(m => ({ default: m.Community })));
const WriteBlog = lazy(() => import("../pages/candidate/WriteBlog").then(m => ({ default: m.WriteBlog })));
const BlogDetail = lazy(() => import("../pages/candidate/BlogDetail").then(m => ({ default: m.BlogDetail })));
const SavedCompanies = lazy(() => import("../pages/candidate/SavedCompanies").then(m => ({ default: m.SavedCompanies })));
const Notifications = lazy(() => import("../pages/candidate/Notifications").then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import("../pages/candidate/Settings").then(m => ({ default: m.Settings })));
const Packages = lazy(() => import("../pages/shared/Packages").then(m => ({ default: m.Packages })));
const Checkout = lazy(() => import("../pages/shared/Checkout").then(m => ({ default: m.Checkout })));
const PaymentSuccess = lazy(() => import("../pages/shared/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
const HRInterviewPrep = lazy(() => import("../pages/candidate/HRInterviewPrep"));
const HRInterviewRoom = lazy(() => import("../pages/candidate/HRInterviewRoom"));
const HRInterviewResult = lazy(() => import("../pages/candidate/HRInterviewResult"));
const Tools = lazy(() => import("../pages/candidate/Tools").then(m => ({ default: m.Tools })));

export const candidateRoutes = [
  { index: true, Component: Home }, // Public: Landing Page
  { 
    path: "jobs", 
    element: <Jobs />
  },
  { 
    path: "jobs/:id", 
    element: <JobDetail />
  },
  {
    path: "tools",
    element: <Tools />
  },
  { 
    path: "companies/:id", 
    element: <ProtectedRoute><CompanyDetail /></ProtectedRoute>
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
    path: "community/write", 
    element: <ProtectedRoute><WriteBlog /></ProtectedRoute>
  },
  { 
    path: "community/post/:id", 
    element: <ProtectedRoute><BlogDetail /></ProtectedRoute>
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
    path: "packages", 
    element: <ProtectedRoute><Packages /></ProtectedRoute>
  },
  {
    path: "checkout/:id",
    element: <ProtectedRoute><Checkout /></ProtectedRoute>
  },
  { 
    path: "payment-success", 
    element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
  },
  { 
    path: "hr-interview/prep/:applicationId", 
    element: <ProtectedRoute><HRInterviewPrep /></ProtectedRoute>
  },
  { 
    path: "hr-interview/room/:interviewId", 
    element: <ProtectedRoute><HRInterviewRoom /></ProtectedRoute>
  },
  { 
    path: "hr-interview/result/:interviewId", 
    element: <ProtectedRoute><HRInterviewResult /></ProtectedRoute>
  },
];
