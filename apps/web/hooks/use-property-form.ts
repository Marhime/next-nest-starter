import { useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usePropertyUpdate } from './use-property-update';
import { usePropertyStep } from './use-property-step';
import { usePropertyContext } from '@/app/[locale]/hosting/[propertyId]/PropertyContext';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';

interface UsePropertyFormOptions {
  propertyId: number;
  stepIndex: number;
  isValid?: boolean;
  payload?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onValidation?: (data: Record<string, any>) => Promise<boolean> | boolean;
}

/**
 * Hook super combiné pour un formulaire de propriété
 * Intègre: validation, update API, step management, navigation
 * Usage: Un seul hook par page = pas de duplication
 */
export function usePropertyForm({
  propertyId,
  stepIndex,
  isValid = false,
  payload,
  onSuccess,
  onValidation,
}: UsePropertyFormOptions) {
  const t = useTranslations('PropertyForm.messages');
  // ✅ Use shared property instance from context - single source of truth!
  const { mutate } = usePropertyContext();
  // ✅ Don't pass onSuccess to usePropertyUpdate - handle it after mutate()
  const { update } = usePropertyUpdate({ propertyId });
  const setIsSaving = useAddPropertyStore((state) => state.setIsSaving);
  const isSaving = useAddPropertyStore((state) => state.isSaving);
  const setIsNavigating = useAddPropertyStore((state) => state.setIsNavigating);
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  // ✅ Set current step automatically - DRY principle
  useEffect(() => {
    setCurrentStep?.(stepIndex);
  }, [setCurrentStep, stepIndex]);

  // ✅ Use refs for callbacks to avoid them being in handleSave deps
  // This prevents cascade of recreations while keeping fresh values
  const onSuccessRef = useRef(onSuccess);
  const onValidationRef = useRef(onValidation);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onValidationRef.current = onValidation;
  }, [onSuccess, onValidation]);

  const handleSave = useCallback(async () => {
    if (!payload) return false;

    // Validation personnalisée avant sauvegarde
    if (onValidationRef.current) {
      const isFormValid = await onValidationRef.current(payload);
      if (!isFormValid) {
        toast.error(t('validationError'));
        return false;
      }
    }

    setIsSaving?.(true);
    try {
      const data = await update(payload);

      // ✅ Wait for data refresh to ensure layout sees updated data
      await mutate();

      // ⚠️ CRITICAL: Wait for React to propagate the updated data through the context
      // This ensures the new page's useStepValidation receives fresh data
      await new Promise((resolve) => setTimeout(resolve, 100));

      toast.success(t('updateSuccess'));

      // ✅ Navigate after mutate is complete AND data propagation
      if (onSuccessRef.current) {
        onSuccessRef.current(data);
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t('updateError');
      toast.error(message);
      return false;
    } finally {
      setIsSaving?.(false);
    }
  }, [payload, update, t, mutate, setIsSaving]);
  // ✅ payload MUST be in deps to avoid stale closure
  // onValidation and onSuccess are in refs to prevent cascade of recreations

  // ✅ Create stable handleNavigateNext with useCallback
  const handleNavigateNext = useCallback(async () => {
    // Mark navigation as in progress to block step validations
    setIsNavigating?.(true);
    try {
      const success = await handleSave();
      // onSuccess is now called inside handleSave after mutate
      return success;
    } finally {
      // Reset navigation state after a delay to ensure new page mounts with correct data
      setTimeout(() => {
        setIsNavigating?.(false);
      }, 200);
    }
  }, [handleSave, setIsNavigating]);
  // ✅ handleSave changes when payload changes, which is expected and correct

  // ✅ Pass handleNavigateNext to usePropertyStep so it registers with the store
  const stepInfo = usePropertyStep({
    propertyId,
    stepIndex,
    isValid,
    onNext: handleNavigateNext,
  });

  return {
    handleSave,
    handleNavigateNext,
    isSaving,
    ...stepInfo,
  };
}
