import { create } from "zustand";

// Store quản lý trạng thái đăng nhập
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
