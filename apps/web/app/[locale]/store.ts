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
  // Login modal state (used to prompt user to sign in before creating a listing)
  isLoginModalOpen?: boolean;
  setIsLoginModalOpen?: (isOpen: boolean) => void;
  // Pending intent when user tried to start creating a listing but needs to login
  pendingCreateIntent?: boolean;
  setPendingCreateIntent?: (v: boolean) => void;
  // Quick-create (phone-only) modal state
  isQuickCreatePhoneModalOpen?: boolean;
  setIsQuickCreatePhoneModalOpen?: (isOpen: boolean) => void;
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
      isLoginModalOpen: false,
      setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      pendingCreateIntent: false,
      setPendingCreateIntent: (v) => set({ pendingCreateIntent: v }),
      isQuickCreatePhoneModalOpen: false,
      setIsQuickCreatePhoneModalOpen: (isOpen) =>
        set({ isQuickCreatePhoneModalOpen: isOpen }),
    }),
    {
      name: 'global-storage', // unique name for your storage item
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
