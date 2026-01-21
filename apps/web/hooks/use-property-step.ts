import { useEffect, useCallback, useRef } from 'react';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';
import { PROPERTY_STEPS, MAX_STEP_INDEX } from '@/lib/step-config';

interface UsePropertyStepOptions {
  propertyId: number;
  stepIndex: number;
  onNext?: () => Promise<boolean> | boolean;
  isValid?: boolean;
}

/**
 * Hook pour gérer toute la logique d'un step du wizard
 * Centralise: currentStep, canProceed, handleNext, propertyProgress
 * Élimine la répétition de 6-7 useEffect dans chaque page
 */
export function usePropertyStep({
  propertyId,
  stepIndex,
  onNext,
  isValid = false,
}: UsePropertyStepOptions) {
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);

  // ✅ Store onNext in ref to avoid triggering effect on every render
  const onNextRef = useRef(onNext);

  // Update ref when onNext changes
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // Initialiser le step courant au montage
  useEffect(() => {
    setCurrentStep?.(stepIndex);
  }, [stepIndex, setCurrentStep]);

  // Mettre à jour canProceed quand isValid change
  useEffect(() => {
    setCanProceed?.(isValid);
  }, [isValid, setCanProceed]);

  // ✅ Create stable handler that always uses latest onNext via ref
  const stableHandler = useCallback(async () => {
    if (onNextRef.current) {
      const result = await onNextRef.current();
      return result;
    }
    return true;
  }, []); // Empty deps - handler never changes, but uses latest onNext via ref

  // ✅ Register handler once on mount
  useEffect(() => {
    setHandleNext?.(stableHandler);

    return () => setHandleNext?.(undefined);
  }, [setHandleNext, stableHandler]); // stableHandler never changes due to empty deps

  // Utilitaires de navigation
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === MAX_STEP_INDEX;
  const nextStepRoute = PROPERTY_STEPS[stepIndex + 1]?.route;
  const prevStepRoute = PROPERTY_STEPS[stepIndex - 1]?.route;

  return {
    isFirstStep,
    isLastStep,
    nextStepRoute,
    prevStepRoute,
  };
}
