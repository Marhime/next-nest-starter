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
};

export const useAddPropertyStore = create<AddPropertyStore>()(
  persist(
    (set) => ({
      setData: (data) => set((state) => ({ ...state, ...data })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setHasShownHelpDrawer: (hasShown) =>
        set({ hasShownHelpDrawer: hasShown }),
      canProceed: false,
      setCanProceed: (canProceed) => set({ canProceed }),
      handleNext: undefined,
      setHandleNext: (handler) => set({ handleNext: handler }),
    }),
    {
      name: 'add-property-storage', // unique name for your storage item
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
