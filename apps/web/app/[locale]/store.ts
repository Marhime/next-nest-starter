import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Pending action types that require authentication
 */
export type PendingActionType =
  | 'favorite'
  | 'unfavorite'
  | 'contact'
  | 'save_search'
  | 'update_profile';

/**
 * Context data for pending actions
 */
export interface PendingActionContext {
  propertyId?: number;
  searchId?: number;
  formData?: Record<string, any>;
  redirectUrl?: string;
  [key: string]: any;
}

/**
 * Pending action saved when user attempts protected action without auth
 */
export interface PendingAction {
  type: PendingActionType;
  context: PendingActionContext;
  timestamp: number;
  preferredMode?: 'login' | 'register';
}

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
  // Login modal state
  isLoginModalOpen?: boolean;
  setIsLoginModalOpen?: (isOpen: boolean) => void;
  // Pending action system - replaces pendingCreateIntent
  pendingAction?: PendingAction | null;
  setPendingAction?: (action: PendingAction | null) => void;
  clearPendingAction?: () => void;
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
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
      // Pending action system
      pendingAction: null,
      setPendingAction: (action) => {
        if (action) {
          set({
            pendingAction: {
              ...action,
              timestamp: Date.now(),
            },
          });
        } else {
          set({ pendingAction: null });
        }
      },
      clearPendingAction: () => set({ pendingAction: null }),
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for temporary actions
      partialize: (state) => ({
        // Persist theme and pending actions, but not modal states
        theme: state.theme,
        pendingAction: state.pendingAction,
        passwordResetEmail: state.passwordResetEmail,
      }),
    },
  ),
);
