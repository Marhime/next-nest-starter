import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { usePropertyUpdate } from './use-property-update';
import { usePropertyStep } from './use-property-step';

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
  const router = useRouter();
  const locale = useLocale();
  const { update } = usePropertyUpdate({ propertyId, onSuccess });

  const handleSave = useCallback(async () => {
    if (!payload) return false;

    // Validation personnalisée avant sauvegarde
    if (onValidation) {
      const isFormValid = await onValidation(payload);
      if (!isFormValid) {
        toast.error('Veuillez remplir tous les champs requis');
        return false;
      }
    }

    try {
      await update(payload);
      toast.success('Annonce mise à jour');
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour';
      toast.error(message);
      return false;
    }
  }, [payload, onValidation, update]);

  const handleNavigateNext = useCallback(async () => {
    const success = await handleSave();
    if (success && onSuccess) {
      // Use the onSuccess callback for navigation
      return success;
    }
    return success;
  }, [handleSave, onSuccess]);

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
    ...stepInfo,
  };
}
