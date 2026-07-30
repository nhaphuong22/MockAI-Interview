import { create } from "zustand";
import { useVerificationStore } from "./useVerificationStore";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

// Store quản lý trạng thái đăng nhập
export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
  setAuth: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      if (user.avatar_url && user.avatar_url.includes("googleusercontent.com")) {
        localStorage.setItem("googleAvatar", user.avatar_url);
      } else if (!user.avatar_url && !user.avatarUrl) {
        localStorage.removeItem("googleAvatar");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("googleAvatar");
      useVerificationStore.getState().clearVerificationData();
    }
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("googleAvatar");
    useVerificationStore.getState().clearVerificationData();
    set({ user: null, isAuthenticated: false });
  },
}));

