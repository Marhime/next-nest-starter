import { useCallback } from 'react';
import { useEditToken } from './use-edit-token';

interface UsePropertyUpdateOptions {
  propertyId: number;
  isAnonymous?: boolean;
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook réutilisable pour toutes les mises à jour de propriété
 * Gère: headers, token, API call, erreurs, notifications
 * Élimine la répétition de code dans chaque étape du formulaire
 */
export function usePropertyUpdate({
  propertyId,
  onSuccess,
  onError,
}: UsePropertyUpdateOptions) {
  const { token: editToken, setToken } = useEditToken(propertyId);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const update = useCallback(
    async (payload: Record<string, unknown>) => {
      try {
        // Préparation automatique des headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (editToken) {
          headers['x-edit-token'] = editToken;
        }

        // API call
        const response = await fetch(`${API_URL}/properties/${propertyId}`, {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erreur lors de la mise à jour');
        }

        const data = await response.json();

        // Si le backend retourne un editToken, le sauvegarder
        if (data && data.editToken) {
          setToken(data.editToken);
        }

        onSuccess?.(data);
        return data;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Erreur inconnue');
        onError?.(err);
        throw err;
      }
    },
    [propertyId, editToken, API_URL, onSuccess, onError, setToken],
  );

  return { update };
}
