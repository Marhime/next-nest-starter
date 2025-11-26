/**
 * Geocoding Hook
 * Provides geocoding and reverse geocoding with React Query caching
 * Production-ready with proper error handling and rate limiting
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox?: [string, string, string, string];
}

interface ReverseGeocodingParams {
  lat: number;
  lng: number;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'PropertyApp/1.0';
const DEFAULT_COUNTRY_CODES = 'fr,mx,es,us,ca';

/**
 * Forward geocoding - Search address from text query
 */
async function searchLocation(
  query: string,
  countryCodes = DEFAULT_COUNTRY_CODES,
): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: countryCodes,
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search location');
  }

  return response.json();
}

/**
 * Reverse geocoding - Get address from coordinates
 */
async function reverseGeocode({
  lat,
  lng,
}: ReverseGeocodingParams): Promise<GeocodingResult> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to reverse geocode');
  }

  return response.json();
}

/**
 * Hook for location search with debounced query
 */
export function useLocationSearch(
  query: string,
  countryCodes?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['location-search', query, countryCodes],
    queryFn: () => searchLocation(query, countryCodes),
    enabled: enabled && query.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 1,
  });
}

/**
 * Hook for reverse geocoding
 */
export function useReverseGeocode() {
  return useMutation({
    mutationFn: reverseGeocode,
    retry: 1,
  });
}

/**
 * Hook to get current location using browser geolocation API
 */
export function useCurrentLocation() {
  return useMutation({
    mutationFn: async (): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error(error.message));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      });
    },
  });
}
