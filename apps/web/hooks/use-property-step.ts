import { useEffect, useCallback } from 'react';
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

  // Initialiser le step courant au montage
  useEffect(() => {
    setCurrentStep?.(stepIndex);
  }, [stepIndex, setCurrentStep]);

  // Mettre à jour canProceed quand isValid change
  useEffect(() => {
    setCanProceed?.(isValid);
  }, [isValid, setCanProceed]);

  // Enregistrer le handler pour le bouton "Suivant"
  useEffect(() => {
    const handler = async () => {
      if (onNext) {
        const result = await onNext();
        return result;
      }
      return true;
    };

    setHandleNext?.(handler);

    return () => setHandleNext?.(undefined);
  }, [onNext, setHandleNext]);

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
