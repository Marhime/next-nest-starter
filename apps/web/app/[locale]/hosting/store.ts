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
  // Track completion state per property
  propertyProgress: Record<
    number,
    {
      completedSteps: number[];
      currentStep: number;
    }
  >;
  setPropertyProgress: (
    propertyId: number,
    step: number,
    completed: boolean,
  ) => void;
  getCurrentPropertyStep: (propertyId: number) => number;
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
      propertyProgress: {},
      setPropertyProgress: (propertyId, step, completed) =>
        set((state) => {
          const progress = state.propertyProgress[propertyId] || {
            completedSteps: [],
            currentStep: 0,
          };

          const completedSteps = completed
            ? [...new Set([...progress.completedSteps, step])]
            : progress.completedSteps.filter((s) => s !== step);

          return {
            propertyProgress: {
              ...state.propertyProgress,
              [propertyId]: {
                completedSteps,
                currentStep: step,
              },
            },
          };
        }),
      getCurrentPropertyStep: (propertyId) => {
        const progress = get().propertyProgress[propertyId];
        if (!progress) return 0;

        // Find first incomplete step
        // Steps mapping (no dedicated "type" page - modal handles type):
        // 0=location, 1=characteristics(about), 2=photos, 3=description
        const steps = [0, 1, 2, 3];
        for (const step of steps) {
          if (!progress.completedSteps.includes(step)) {
            return step;
          }
        }
        // All steps completed, return last step index
        return 4;
      },
    }),
    {
      name: 'add-property-storage', // unique name for your storage item
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
