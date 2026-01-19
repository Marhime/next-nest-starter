import { create } from 'zustand';
import { AddPropertySchema } from '@/features/add-property/schema';
import { createJSONStorage, persist } from 'zustand/middleware';

type AddPropertyStore = Partial<AddPropertySchema> & {
  setData: (data: Partial<AddPropertySchema>) => void;
  setCurrentStep: (step: number) => void;
  currentStep?: number;
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
  hasShownHelpDrawer?: boolean;
  setHasShownHelpDrawer?: (hasShown: boolean) => void;
  canProceed?: boolean;
  setCanProceed?: (canProceed: boolean) => void;
  handleNext?: () => void;
  setHandleNext?: (handler: (() => void) | undefined) => void;
  // Edit tokens for anonymous property editing
  editTokens: Record<number, string>;
  setEditToken: (propertyId: number, token: string) => void;
  getEditToken: (propertyId: number) => string | undefined;
  clearEditToken: (propertyId: number) => void;
};

export const useAddPropertyStore = create<AddPropertyStore>()(
  persist(
    (set, get) => ({
      setData: (data) => set((state) => ({ ...state, ...data })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setHasShownHelpDrawer: (hasShown) =>
        set({ hasShownHelpDrawer: hasShown }),
      canProceed: false,
      setCanProceed: (canProceed) => set({ canProceed }),
      handleNext: undefined,
      setHandleNext: (handler) => set({ handleNext: handler }),
      editTokens: {},
      setEditToken: (propertyId, token) =>
        set((state) => ({
          editTokens: { ...state.editTokens, [propertyId]: token },
        })),
      getEditToken: (propertyId) => {
        return get().editTokens[propertyId];
      },
      clearEditToken: (propertyId) =>
        set((state) => {
          const { [propertyId]: _, ...rest } = state.editTokens;
          return { editTokens: rest };
        }),
    }),
    {
      name: 'add-property-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
    },
  ),
);
