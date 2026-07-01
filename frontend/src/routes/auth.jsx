import { VerifyEmail } from "../pages/shared/VerifyEmail";
import { ResetPassword } from "../pages/shared/ResetPassword";
import AcceptInvitation from "../pages/recruiter/AcceptInvitation";

export const authRoutes = [
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/recruiter/accept-invitation", Component: AcceptInvitation },
];
