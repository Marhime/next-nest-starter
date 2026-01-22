'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchStore } from '@/stores/search-store';
import { authClient } from '@/lib/auth/auth-client';

interface SearchFilters {
  listingType?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  propertyType?: string | null;
  minBedrooms?: number | null;
  maxBedrooms?: number | null;
  minBathrooms?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  amenities?: string[] | null;
}

export interface SavedSearch {
  id: number;
  userId: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch all saved searches for current user
export function useSavedSearches() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  return useQuery<SavedSearch[]>({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/saved-searches`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch saved searches');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // ✅ Only fetch if authenticated
  });
}

// Get count of saved searches
export function useSavedSearchesCount() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  return useQuery<number>({
    queryKey: ['saved-searches', 'count'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/saved-searches/count`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return 0;
        }
        throw new Error('Failed to fetch count');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated, // ✅ Only fetch if authenticated
  });
}

// Save current search filters
export function useSaveCurrentSearch() {
  const queryClient = useQueryClient();
  const store = useSearchStore();

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      // Get current filters from store
      const filters = {
        listingType: store.listingType,
        location: store.location,
        latitude: store.latitude,
        longitude: store.longitude,
        minPrice: store.minPrice,
        maxPrice: store.maxPrice,
        propertyType: store.propertyType,
        minBedrooms: store.minBedrooms,
        maxBedrooms: store.maxBedrooms,
        minBathrooms: store.minBathrooms,
        minArea: store.minArea,
        maxArea: store.maxArea,
        amenities: store.amenities,
      };

      const response = await fetch(`${API_URL}/saved-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, filters }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You must be logged in to save searches');
        }
        throw new Error('Failed to save search');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  return {
    saveSearch: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Apply saved search filters
export function useApplySavedSearch() {
  const {
    setListingType,
    setLocation,
    setMapCenter,
    setPriceRange,
    setPropertyType,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    toggleAmenity,
  } = useSearchStore();

  const applySearch = (savedSearch: SavedSearch) => {
    const { filters } = savedSearch;

    // Apply all filters to store
    if (filters.listingType !== undefined && filters.listingType !== null) {
      setListingType(filters.listingType as 'SALE' | 'RENT');
    }
    if (filters.location && filters.latitude && filters.longitude) {
      setLocation(filters.location, filters.latitude, filters.longitude);
      setMapCenter([filters.latitude, filters.longitude]);
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      setPriceRange(filters.minPrice ?? null, filters.maxPrice ?? null);
    }
    if (filters.propertyType !== undefined && filters.propertyType !== null) {
      setPropertyType(filters.propertyType as 'HOUSE' | 'APARTMENT' | 'LAND');
    }
    if (
      filters.minBedrooms !== undefined ||
      filters.maxBedrooms !== undefined
    ) {
      setBedroomsRange(
        filters.minBedrooms ?? null,
        filters.maxBedrooms ?? null,
      );
    }
    if (filters.minBathrooms !== undefined) {
      setBathroomsMin(filters.minBathrooms);
    }
    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      setAreaRange(filters.minArea ?? null, filters.maxArea ?? null);
    }
    if (filters.amenities && Array.isArray(filters.amenities)) {
      // Clear existing amenities and set new ones
      filters.amenities.forEach((amenity) => {
        toggleAmenity(amenity);
      });
    }
  };

  return { applySearch };
}

// Delete saved search
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/saved-searches/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete saved search');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  return {
    deleteSearch: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

// Update saved search
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      name,
      filters,
    }: {
      id: number;
      name?: string;
      filters?: SearchFilters;
    }) => {
      const response = await fetch(`${API_URL}/saved-searches/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, filters }),
      });

      if (!response.ok) {
        throw new Error('Failed to update saved search');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  return {
    updateSearch: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
