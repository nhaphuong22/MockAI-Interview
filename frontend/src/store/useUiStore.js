import { create } from 'zustand';

export const useUiStore = create((set) => ({
  hideNavbar: false,
  setHideNavbar: (hide) => set({ hideNavbar: hide }),

  // Auth Modal State
  authModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  authRedirectTo: null,

  openAuthModal: ({ mode = 'login', redirectTo = null } = {}) =>
    set({
      authModalOpen: true,
      authModalMode: mode,
      authRedirectTo: redirectTo,
    }),

  closeAuthModal: () =>
    set({
      authModalOpen: false,
      authRedirectTo: null,
    }),

  setAuthRedirectTo: (path) => set({ authRedirectTo: path }),

  // Toast Notification State
  toastVisible: false,
  toastMessage: '',
  toastType: 'info', // 'info' | 'success' | 'warning' | 'error'

  showToast: ({ message, type = 'info' }) =>
    set({
      toastVisible: true,
      toastMessage: message,
      toastType: type,
    }),

  hideToast: () =>
    set({
      toastVisible: false,
    }),
}));
