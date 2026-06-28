import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { DataPrivacyAgreement } from "../pages/recruiter/DataPrivacyAgreement";
import { candidateRoutes } from "./candidate";
import { recruiterRoutes } from "./recruiter";
import { adminRoutes } from "./admin";
import { authRoutes } from "./auth";

export const router = createBrowserRouter([
  // Candidate Routes (Trang chủ)
  {
    path: "/",
    Component: Layout,
    children: candidateRoutes,
  },

  // Recruiter Dashboard (Sau đăng nhập tại /hr)
  {
    path: "/hr/dashboard",
    Component: Layout,
    children: recruiterRoutes,
  },

  // Administrator Dashboard (Sau đăng nhập tại /admin)
  {
    path: "/admin/dashboard",
    Component: Layout,
    children: adminRoutes,
  },

  // Auth standalone pages (no Layout wrapper)
  ...authRoutes,

  // Public Legal/Information standalone pages
  {
    path: "/data-privacy-agreement",
    Component: DataPrivacyAgreement,
  }
]);
