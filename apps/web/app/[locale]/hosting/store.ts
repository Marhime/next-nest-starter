import { create } from 'zustand';
import { AddPropertySchema } from '@/features/add-property/schema';
import { createJSONStorage, persist } from 'zustand/middleware';

type AddPropertyStore = Partial<AddPropertySchema> & {
  setData: (data: Partial<AddPropertySchema>) => void;
  setCurrentStep: (step: number) => void;
  currentStep?: number | undefined;
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
  hasShownHelpDrawer?: boolean;
  setHasShownHelpDrawer?: (hasShown: boolean) => void;
  canProceed?: boolean;
  setCanProceed?: (canProceed: boolean) => void;
  handleNext?: () => void;
  setHandleNext?: (handler: (() => void) | undefined) => void;
  isSaving?: boolean;
  setIsSaving?: (isSaving: boolean) => void;
  // Edit tokens for anonymous property editing
  editTokens: Record<number, string>;
  setEditToken: (propertyId: number, token: string) => void;
  getEditToken: (propertyId: number) => string | undefined;
  clearEditToken: (propertyId: number) => void;
  // Step completion tracking per property
  completedSteps: Record<number, Set<number>>; // propertyId -> Set of completed step indices
  markStepComplete: (propertyId: number, stepIndex: number) => void;
  isStepComplete: (propertyId: number, stepIndex: number) => boolean;
  clearPropertySteps: (propertyId: number) => void;
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
      isSaving: false,
      setIsSaving: (isSaving) => set({ isSaving }),
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
      completedSteps: {},
      markStepComplete: (propertyId, stepIndex) =>
        set((state) => {
          const propertySteps = state.completedSteps[propertyId] || new Set();
          const newSet = new Set(propertySteps);
          newSet.add(stepIndex);
          return {
            completedSteps: {
              ...state.completedSteps,
              [propertyId]: newSet,
            },
          };
        }),
      isStepComplete: (propertyId, stepIndex) => {
        const propertySteps = get().completedSteps[propertyId];
        return propertySteps ? propertySteps.has(stepIndex) : false;
      },
      clearPropertySteps: (propertyId) =>
        set((state) => {
          const { [propertyId]: _, ...rest } = state.completedSteps;
          return { completedSteps: rest };
        }),
    }),
    {
      name: 'add-property-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        editTokens: state.editTokens,
        completedSteps: Object.fromEntries(
          Object.entries(state.completedSteps).map(([key, value]) => [
            key,
            Array.from(value),
          ]),
        ),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: Object.fromEntries(
          Object.entries(persistedState?.completedSteps || {}).map(
            ([key, value]) => [key, new Set(value as number[])],
          ),
        ),
      }),
    },
  ),
);
