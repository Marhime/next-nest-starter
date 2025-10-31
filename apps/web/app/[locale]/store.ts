import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type GlobalStore = {
  setTheme?: (theme: 'light' | 'dark') => void;
  theme?: 'light' | 'dark';
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
  setPasswordResetEmail?: (email: string) => void;
  clearPasswordResetEmail?: () => void;
  passwordResetEmail?: string | null;
  // Property type modal state
  isPropertyTypeModalOpen?: boolean;
  setIsPropertyTypeModalOpen?: (isOpen: boolean) => void;
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      setTheme: (theme) => set({ theme }),
      theme: 'light',
      setIsOpen: (isOpen) => set({ isOpen }),
      setPasswordResetEmail: (email) => set({ passwordResetEmail: email }),
      clearPasswordResetEmail: () => set({ passwordResetEmail: null }),
      passwordResetEmail: null,
      isPropertyTypeModalOpen: false,
      setIsPropertyTypeModalOpen: (isOpen) =>
        set({ isPropertyTypeModalOpen: isOpen }),
    }),
    {
      name: 'global-storage', // unique name for your storage item
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
