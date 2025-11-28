/**
 * usePropertyData Hook
 * Centralized data fetching with filters from unified store
 * Uses useQuery for paginated list + separate query for map markers
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useSearchStore } from '@/stores/search-store';
import type { Property, PropertyMarker } from '@/stores/search-store';

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
  page?: number;
  limit?: number;
}

interface PropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ✅ Minimum delay for smooth UX (like Airbnb/Apple)
const MIN_LOADING_TIME = 600; // 600ms minimum

// Fetch properties with pagination (for list)
async function fetchPropertiesPaginated(
  params: FetchPropertiesParams,
): Promise<PropertiesResponse> {
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

  // Add map bounds (required for nearby search)
  if (params.mapBounds) {
    queryParams.set('north', params.mapBounds.north.toString());
    queryParams.set('south', params.mapBounds.south.toString());
    queryParams.set('east', params.mapBounds.east.toString());
    queryParams.set('west', params.mapBounds.west.toString());
  }

  // Add pagination
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

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

    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);

    // ✅ Also apply minimum delay on error for consistency
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    throw error;
  }
}

// Fetch map markers (lightweight, no pagination)
async function fetchMapMarkers(
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null,
): Promise<PropertyMarker[]> {
  if (!mapBounds) return [];

  const queryParams = new URLSearchParams({
    north: mapBounds.north.toString(),
    south: mapBounds.south.toString(),
    east: mapBounds.east.toString(),
    west: mapBounds.west.toString(),
  });

  try {
    const response = await fetch(
      `${API_URL}/properties/map-markers?${queryParams}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching map markers:', error);
    return [];
  }
}

/**
 * Hook to fetch and manage properties data with pagination
 * Synchronizes React Query with Zustand store
 */
export function usePropertyData() {
  const {
    setProperties,
    setLoading,
    setFetching,
    setError,
    setMapMarkers,
    setMarkersLoading,
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
  // Note: We fetch ALL results (limit: 100) for client-side pagination
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
      page: 1, // Always fetch first page
      limit: 100, // Fetch all results (max 100) for client-side pagination
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

  // Query for properties list (with pagination)
  const propertiesQuery = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => fetchPropertiesPaginated(queryParams),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Separate query for map markers (lightweight, no pagination)
  const markersQuery = useQuery({
    queryKey: ['map-markers', mapBounds],
    queryFn: () => fetchMapMarkers(mapBounds),
    enabled: !!mapBounds, // Only fetch when bounds exist
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });

  // Sync properties query state with Zustand store
  // Note: We store ALL properties, pagination is done client-side
  useEffect(() => {
    if (propertiesQuery.data) {
      setProperties(propertiesQuery.data.data);
      // Don't set totalPages/totalResults since we do client-side pagination
    }
  }, [propertiesQuery.data, setProperties]);

  useEffect(() => {
    setLoading(propertiesQuery.isLoading);
  }, [propertiesQuery.isLoading, setLoading]);

  useEffect(() => {
    setFetching(propertiesQuery.isFetching);
  }, [propertiesQuery.isFetching, setFetching]);

  useEffect(() => {
    setError(propertiesQuery.error as Error | null);
  }, [propertiesQuery.error, setError]);

  // Sync map markers with store
  useEffect(() => {
    if (markersQuery.data) {
      setMapMarkers(markersQuery.data);
    }
  }, [markersQuery.data, setMapMarkers]);

  useEffect(() => {
    setMarkersLoading(markersQuery.isLoading);
  }, [markersQuery.isLoading, setMarkersLoading]);

  return propertiesQuery;
}
