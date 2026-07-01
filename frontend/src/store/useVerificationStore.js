import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVerificationStore = create(
  persist(
    (set) => ({
      tab2Data: null,
      isTab2Completed: false,

      saveTab2Data: (data) => set({
        tab2Data: data,
        isTab2Completed: true
      }),

      clearVerificationData: () => set({
        tab2Data: null,
        isTab2Completed: false
      })
    }),
    {
      name: 'hr-verification-storage',
    }
  )
);
