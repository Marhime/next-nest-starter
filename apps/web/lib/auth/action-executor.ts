'use client';

import { toast } from 'sonner';
import type { PendingAction } from '@/app/[locale]/store';

/**
 * Action timeout in milliseconds (30 minutes)
 */
const ACTION_TIMEOUT = 30 * 60 * 1000;

/**
 * Checks if a pending action has expired
 */
export function isActionExpired(action: PendingAction): boolean {
  return Date.now() - action.timestamp > ACTION_TIMEOUT;
}

/**
 * Executor for 'favorite' action - adds property to favorites
 */
async function executeFavoriteAction(context: PendingAction['context']) {
  const { propertyId } = context;

  if (!propertyId) {
    throw new Error('Property ID is required for favorite action');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/favorites/${propertyId}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to add to favorites');
  }

  toast.success('Added to favorites!');

  // Trigger revalidation if available in context
  if (context.onSuccess && typeof context.onSuccess === 'function') {
    await context.onSuccess();
  }
}

/**
 * Executor for 'unfavorite' action - removes property from favorites
 */
async function executeUnfavoriteAction(context: PendingAction['context']) {
  const { propertyId } = context;

  if (!propertyId) {
    throw new Error('Property ID is required for unfavorite action');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/favorites/${propertyId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }

  toast.success('Removed from favorites!');

  // Trigger revalidation if available in context
  if (context.onSuccess && typeof context.onSuccess === 'function') {
    await context.onSuccess();
  }
}

/**
 * Executor for 'contact' action - redirects to contact form with prefilled data
 */
async function executeContactAction(context: PendingAction['context']) {
  const { redirectUrl, formData } = context;

  // Store form data in sessionStorage for prefill after redirect
  if (formData) {
    sessionStorage.setItem('prefill-contact-form', JSON.stringify(formData));
  }

  if (redirectUrl) {
    // Small delay to ensure session is fully updated
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.location.href = redirectUrl;
  } else {
    toast.success(
      'Vous êtes maintenant connecté! Vos informations seront pré-remplies.',
    );
  }
}

/**
 * Executor for 'save_search' action - saves current search filters
 */
async function executeSaveSearchAction(context: PendingAction['context']) {
  const { searchData } = context;

  if (!searchData) {
    throw new Error('Search data is required for save_search action');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/saved-searches`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchData),
  });

  if (!response.ok) {
    throw new Error('Failed to save search');
  }

  toast.success('Search saved successfully!');
}

/**
 * Executes a pending action based on its type
 *
 * @param action - The pending action to execute
 * @throws Error if action type is unknown or execution fails
 */
export async function executePendingAction(
  action: PendingAction,
): Promise<void> {
  // Check if action has expired
  if (isActionExpired(action)) {
    toast.error('This action has expired. Please try again.');
    return;
  }

  try {
    switch (action.type) {
      case 'favorite':
        await executeFavoriteAction(action.context);
        break;

      case 'unfavorite':
        await executeUnfavoriteAction(action.context);
        break;

      case 'contact':
        await executeContactAction(action.context);
        break;

      case 'save_search':
        await executeSaveSearchAction(action.context);
        break;

      case 'update_profile':
        // Placeholder for future implementation
        toast.info('Profile update action - to be implemented');
        break;

      default: {
        // Type-safe exhaustive check
        const _exhaustive: never = action.type;
        throw new Error(`Unknown action type: ${_exhaustive}`);
      }
    }
  } catch (error) {
    console.error('Failed to execute pending action:', error);
    toast.error(
      error instanceof Error ? error.message : 'Failed to complete action',
    );
    throw error;
  }
}
