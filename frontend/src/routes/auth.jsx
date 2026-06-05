import { VerifyEmail } from "../pages/shared/VerifyEmail";
import { ResetPassword } from "../pages/shared/ResetPassword";

export const authRoutes = [
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/reset-password", Component: ResetPassword },
];
