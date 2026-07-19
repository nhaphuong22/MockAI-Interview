import { lazy } from "react";
const VerifyEmail = lazy(() => import("../pages/shared/VerifyEmail").then(m => ({ default: m.VerifyEmail })));
const ResetPassword = lazy(() => import("../pages/shared/ResetPassword").then(m => ({ default: m.ResetPassword })));
const AcceptInvitation = lazy(() => import("../pages/recruiter/AcceptInvitation"));

export const authRoutes = [
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/recruiter/accept-invitation", Component: AcceptInvitation },
];
