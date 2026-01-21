/**
 * Favorites Hooks
 * SWR-based hooks for managing user favorites
 */

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Property } from '@/stores/search-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FavoritesResponse {
  data: Property[];
  count: number;
}

/**
 * Fetcher function for SWR with credentials
 */
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch favorites');
  }

  return res.json();
};

/**
 * Get all favorited properties for the authenticated user
 */
export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<Property[]>(
    `${API_URL}/api/favorites`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    favorites: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Get favorites count for badge display
 */
export function useFavoritesCount() {
  const { data, error, isLoading } = useSWR<number>(
    `${API_URL}/api/favorites/count`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return {
    count: data || 0,
    isLoading,
    error,
  };
}

/**
 * Check if a specific property is favorited
 */
export function useIsFavorited(propertyId: number | undefined) {
  const { data, error, isLoading } = useSWR<boolean>(
    propertyId ? `${API_URL}/api/favorites/check/${propertyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return {
    isFavorited: data || false,
    isLoading,
    error,
  };
}

/**
 * Toggle favorite status for a property
 * Includes optimistic updates and error handling
 */
export function useToggleFavorite() {
  const t = useTranslations('Account.favorites');
  const { mutate: mutateFavorites } = useFavorites();
  const { mutate: mutateCount } = useSWR(`${API_URL}/api/favorites/count`);

  const toggleFavorite = async (
    propertyId: number,
    currentStatus: boolean,
  ): Promise<boolean> => {
    const endpoint = `${API_URL}/api/favorites/${propertyId}`;
    const method = currentStatus ? 'DELETE' : 'POST';

    try {
      // Optimistically update UI
      const newStatus = !currentStatus;

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update favorite');
      }

      // Revalidate favorites list and count
      mutateFavorites();
      mutateCount();

      // Show success message
      toast.success(newStatus ? t('addSuccess') : t('removeSuccess'));

      return newStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(currentStatus ? t('removeError') : t('addError'));
      throw error;
    }
  };

  return { toggleFavorite };
}

/**
 * Add a property to favorites
 */
export async function addToFavorites(propertyId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/favorites/${propertyId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to add to favorites');
  }
}

/**
 * Remove a property from favorites
 */
export async function removeFromFavorites(propertyId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/favorites/${propertyId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to remove from favorites');
  }
}
