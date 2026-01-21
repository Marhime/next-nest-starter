/**
 * usePropertyDetails Hook
 * Fetches full property details for specific IDs (paginated)
 * Used by PropertyResultList to display detailed cards
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { Property } from '@/stores/search-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface PropertyDetailsResponse {
  data: Property[];
  meta: {
    total: number;
    ids: number[];
  };
}

/**
 * Fetch full property details by IDs
 * Returns complete Property objects with all fields
 */
async function fetchPropertyDetails(
  ids: number[],
): Promise<PropertyDetailsResponse> {
  if (ids.length === 0) {
    return { data: [], meta: { total: 0, ids: [] } };
  }

  try {
    const response = await fetch(`${API_URL}/properties/by-ids`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `✅ Fetched ${data.data.length} property details for IDs:`,
      ids,
    );

    return data;
  } catch (error) {
    console.error('❌ Error fetching property details:', error);
    return { data: [], meta: { total: 0, ids: [] } };
  }
}

/**
 * Hook to fetch full property details for given IDs
 * Used by PropertyResultList for paginated display
 */
export function usePropertyDetails(ids: number[]) {
  const detailsQuery = useQuery({
    queryKey: ['property-details', ids],
    queryFn: () => fetchPropertyDetails(ids),
    enabled: ids.length > 0,
    staleTime: 60 * 1000, // 60s cache (properties don't change often)
    gcTime: 10 * 60 * 1000, // 10min garbage collection
    refetchOnWindowFocus: false,
  });

  return {
    properties: detailsQuery.data?.data || [],
    isLoading: detailsQuery.isLoading,
    isFetching: detailsQuery.isFetching,
    error: detailsQuery.error,
  };
}
