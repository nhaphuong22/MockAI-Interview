import { Home } from "../pages/candidate/Home";
import { Jobs } from "../pages/candidate/Jobs";
import { JobDetail } from "../pages/candidate/JobDetail";
import { CompanyDetail } from "../pages/candidate/CompanyDetail";
import { SavedJobs } from "../pages/candidate/SavedJobs";
import { ApplicationTracking } from "../pages/candidate/ApplicationTracking";
import { Profile } from "../pages/candidate/Profile";
import { CVReview } from "../pages/candidate/CVReview";
import { InterviewPractice } from "../pages/candidate/InterviewPractice";
import { Community } from "../pages/candidate/Community";
import { WriteBlog } from "../pages/candidate/WriteBlog";
import { BlogDetail } from "../pages/candidate/BlogDetail";
import { SavedCompanies } from "../pages/candidate/SavedCompanies";
import { Notifications } from "../pages/candidate/Notifications";
import { Settings } from "../pages/candidate/Settings";
import { Payment } from "../pages/shared/Payment";
import { PaymentSuccess } from "../pages/shared/PaymentSuccess";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export const candidateRoutes = [
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
    path: "payment", 
    element: <ProtectedRoute><Payment /></ProtectedRoute>
  },
  { 
    path: "payment-success", 
    element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
  },
];
