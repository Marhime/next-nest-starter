/**
 * useMapMarkers Hook
 * Fetches filtered map markers (lightweight) - Single Source of Truth
 * All filters applied, returns only IDs and basic info for map display
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useSearchStore, type PropertyMarker } from '@/stores/search-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchMarkersParams {
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

/**
 * Fetch map markers with ALL filters applied
 * Returns lightweight data: id, lat, lng, price, propertyType
 */
async function fetchMapMarkers(
  params: FetchMarkersParams,
): Promise<PropertyMarker[]> {
  if (!params.mapBounds) {
    console.log('⚠️ No mapBounds, skipping markers fetch');
    return [];
  }

  const queryParams = new URLSearchParams();

  // Map bounds (required)
  queryParams.set('north', params.mapBounds.north.toString());
  queryParams.set('south', params.mapBounds.south.toString());
  queryParams.set('east', params.mapBounds.east.toString());
  queryParams.set('west', params.mapBounds.west.toString());

  // All filters (applied backend)
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

  try {
    const response = await fetch(
      `${API_URL}/properties/map-markers?${queryParams}`,
      {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const markers = await response.json();
    console.log(
      `✅ Fetched ${markers.length} filtered markers`,
      params.listingType,
      params.minPrice ? `${params.minPrice}-${params.maxPrice}` : 'all prices',
    );

    return markers;
  } catch (error) {
    console.error('❌ Error fetching map markers:', error);
    return [];
  }
}

/**
 * Hook to fetch and manage map markers (Single Source of Truth)
 * Synchronizes with Zustand store
 */
export function useMapMarkers() {
  const {
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
  const queryParams = useMemo<FetchMarkersParams>(
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

  // Query for map markers (lightweight, all filtered)
  const markersQuery = useQuery({
    queryKey: ['map-markers', queryParams],
    queryFn: () => fetchMapMarkers(queryParams),
    enabled: !!mapBounds, // Only fetch when bounds exist
    staleTime: 30 * 1000, // 30s cache
    gcTime: 5 * 60 * 1000, // 5min garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Sync markers with store
  useEffect(() => {
    if (markersQuery.data) {
      setMapMarkers(markersQuery.data);
    }
  }, [markersQuery.data, setMapMarkers]);

  useEffect(() => {
    setMarkersLoading(markersQuery.isLoading);
  }, [markersQuery.isLoading, setMarkersLoading]);

  return {
    markers: markersQuery.data || [],
    isLoading: markersQuery.isLoading,
    isFetching: markersQuery.isFetching,
    error: markersQuery.error,
  };
}
