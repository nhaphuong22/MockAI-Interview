import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
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

  // Multiple Toast Notification State
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    // Auto remove toast after 4 seconds (4000ms)
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },

  showToast: (payload) => {
    if (!payload) return;
    const message = typeof payload === 'string' ? payload : payload.message;
    const type = typeof payload === 'string' ? 'info' : (payload.type || 'info');
    get().addToast(message, type);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));

