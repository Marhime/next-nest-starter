'use client';

import { useCallback } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import {
  useGlobalStore,
  type PendingActionType,
  type PendingActionContext,
} from '@/app/[locale]/store';

/**
 * Hook to wrap actions that require authentication.
 *
 * If user is not authenticated, saves the action context and opens login modal.
 * If user is authenticated, executes the action immediately.
 *
 * @example
 * ```tsx
 * const { requireAuth, isAuthenticated } = useProtectedAction();
 *
 * const handleFavorite = useCallback(async () => {
 *   await requireAuth(
 *     async () => {
 *       await toggleFavorite(propertyId);
 *     },
 *     'favorite',
 *     { propertyId }
 *   );
 * }, [propertyId, requireAuth]);
 * ```
 */
export function useProtectedAction() {
  const { data: session, isPending } = authClient.useSession();
  const setPendingAction = useGlobalStore((s) => s.setPendingAction);
  const setIsLoginModalOpen = useGlobalStore((s) => s.setIsLoginModalOpen);

  const isAuthenticated = !!session?.user;

  /**
   * Wraps an action to require authentication.
   *
   * @param action - The async action to execute if authenticated
   * @param actionType - Type of action (for routing after login)
   * @param context - Additional context data (propertyId, formData, etc.)
   * @param preferredMode - Preferred modal mode ('login' or 'register')
   * @returns Promise that resolves with action result or null if auth required
   */
  const requireAuth = useCallback(
    async <T = void>(
      action: () => Promise<T>,
      actionType: PendingActionType,
      context: PendingActionContext = {},
      preferredMode: 'login' | 'register' = 'login',
    ): Promise<T | null> => {
      // If session is still loading, wait a bit
      if (isPending) {
        return null;
      }

      // If authenticated, execute action immediately
      if (session?.user) {
        return await action();
      }

      // Save pending action and open login modal
      setPendingAction?.({
        type: actionType,
        context,
        timestamp: Date.now(),
        preferredMode,
      });

      setIsLoginModalOpen?.(true);

      return null;
    },
    [session, isPending, setPendingAction, setIsLoginModalOpen],
  );

  return {
    requireAuth,
    isAuthenticated,
    isPending,
  };
}
