/**
 * usePropertyData Hook
 * Centralized data fetching with filters from unified store
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useSearchStore } from '@/stores/search-store';
import type { Property } from '@/stores/search-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchPropertiesParams {
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// ✅ Minimum delay for smooth UX (like Airbnb/Apple)
const MIN_LOADING_TIME = 600; // 600ms minimum

// Fetch properties with filters
async function fetchProperties(params: FetchPropertiesParams) {
  const startTime = Date.now();

  const queryParams = new URLSearchParams();

  // Add filters to query
  if (params.listingType) queryParams.set('listingType', params.listingType);
  if (params.minPrice) queryParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.set('maxPrice', params.maxPrice.toString());
  if (params.propertyType) queryParams.set('propertyType', params.propertyType);
  if (params.minBedrooms)
    queryParams.set('minBedrooms', params.minBedrooms.toString());
  if (params.maxBedrooms)
    queryParams.set('maxBedrooms', params.maxBedrooms.toString());
  if (params.minBathrooms)
    queryParams.set('minBathrooms', params.minBathrooms.toString());
  if (params.minArea) queryParams.set('minArea', params.minArea.toString());
  if (params.maxArea) queryParams.set('maxArea', params.maxArea.toString());
  if (params.amenities && params.amenities.length > 0) {
    queryParams.set('amenities', params.amenities.join(','));
  }

  // Add map bounds if available (for nearby search)
  if (params.mapBounds) {
    queryParams.set('north', params.mapBounds.north.toString());
    queryParams.set('south', params.mapBounds.south.toString());
    queryParams.set('east', params.mapBounds.east.toString());
    queryParams.set('west', params.mapBounds.west.toString());
  }

  try {
    // Use nearby endpoint if map bounds exist, otherwise use main endpoint
    const endpoint = params.mapBounds
      ? `${API_URL}/properties/nearby?${queryParams}`
      : `${API_URL}/properties?${queryParams}`;

    const response = await fetch(endpoint, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // ✅ Ensure minimum loading time for smooth UX
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
    return (data?.data || data) as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);

    // ✅ Also apply minimum delay on error for consistency
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return [] as Property[];
  }
}

/**
 * Hook to fetch and manage properties data with filters
 * Synchronizes React Query with Zustand store
 */
export function usePropertyData() {
  const {
    setProperties,
    setLoading,
    setFetching,
    setError,
    listingType,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
    mapBounds,
  } = useSearchStore();

  // Build query params from store filters
  const queryParams = useMemo<FetchPropertiesParams>(
    () => ({
      listingType: listingType || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      propertyType: propertyType || undefined,
      minBedrooms: minBedrooms || undefined,
      maxBedrooms: maxBedrooms || undefined,
      minBathrooms: minBathrooms || undefined,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      mapBounds: mapBounds || undefined,
    }),
    [
      listingType,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      minArea,
      maxArea,
      amenities,
      mapBounds,
    ],
  );

  const query = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => fetchProperties(queryParams),
    staleTime: 0, // Always refetch when filters change
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Refetch on component mount
  });

  // Sync React Query state with Zustand store
  useEffect(() => {
    if (query.data) {
      setProperties(query.data);
    }
  }, [query.data, setProperties]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  // ✅ Sync isFetching (true during initial load AND refetch)
  useEffect(() => {
    setFetching(query.isFetching);
  }, [query.isFetching, setFetching]);

  useEffect(() => {
    setError(query.error as Error | null);
  }, [query.error, setError]);

  return query;
}
