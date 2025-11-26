/**
 * Unified Property Search Store
 * Complete state management: filters, properties, map, UI, URL sync
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ListingType = 'SALE' | 'RENT' | 'SHORT_TERM' | null;
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA' | null;

// Property interface (from API)
export interface Property {
  id: number;
  userId: string;
  propertyType: string;
  listingType?: string;
  title: string;
  description?: string;
  status: string;
  monthlyPrice?: string;
  nightlyPrice?: string;
  salePrice?: string;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  photos: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Map bounds interface
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Search filters
export interface SearchFilters {
  // Core search
  listingType: ListingType;
  location: string | null;
  latitude: number | null;
  longitude: number | null;

  // Price
  minPrice: number | null;
  maxPrice: number | null;

  // Property details
  propertyType: PropertyType;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;

  // Amenities
  amenities: string[];

  // Map bounds (for nearby search)
  mapBounds: MapBounds | null;
}

// Main store state
export interface SearchState extends SearchFilters {
  // Properties data
  properties: Property[];
  isLoading: boolean;
  isFetching: boolean; // ✅ True during any fetch (initial or refetch)
  error: Error | null;

  // Map state
  mapCenter: [number, number];
  mapZoom: number;

  // Selection state
  selectedPropertyId: number | null;
  hoveredPropertyId: number | null;

  // UI State
  isFiltersOpen: boolean;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;

  // Filter Actions
  setListingType: (type: ListingType) => void;
  setLocation: (location: string | null, lat?: number, lng?: number) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setPropertyType: (type: PropertyType) => void;
  setBedroomsRange: (min: number | null, max: number | null) => void;
  setBathroomsMin: (min: number | null) => void;
  setAreaRange: (min: number | null, max: number | null) => void;
  toggleAmenity: (amenity: string) => void;
  setMapBounds: (bounds: MapBounds | null) => void;

  // Properties Actions
  setProperties: (properties: Property[]) => void;
  setLoading: (loading: boolean) => void;
  setFetching: (fetching: boolean) => void;
  setError: (error: Error | null) => void;

  // Map Actions
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;

  // Selection Actions
  selectProperty: (id: number | null) => void;
  hoverProperty: (id: number | null) => void;

  // UI Actions
  toggleFilters: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  resetFilters: () => void;

  // URL Sync
  setFiltersFromURL: (params: URLSearchParams) => void;
  toURLParams: () => URLSearchParams;
}

const initialFilters: SearchFilters = {
  listingType: null,
  location: null,
  latitude: null,
  longitude: null,
  minPrice: null,
  maxPrice: null,
  propertyType: null,
  minBedrooms: null,
  maxBedrooms: null,
  minBathrooms: null,
  minArea: null,
  maxArea: null,
  amenities: [],
  mapBounds: null,
};

const INITIAL_SIDEBAR_WIDTH = 60;
const MIN_SIDEBAR_WIDTH = 30;
const MAX_SIDEBAR_WIDTH = 80;

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - Filters
        ...initialFilters,

        // Initial state - Properties
        properties: [],
        isLoading: false,
        isFetching: false,
        error: null,

        // Initial state - Map (Puerto Escondido, Mexico)
        mapCenter: [15.8651, -97.0737], // Puerto Escondido by default
        mapZoom: 10,

        // Initial state - Selection
        selectedPropertyId: null,
        hoveredPropertyId: null,

        // Initial state - UI
        isFiltersOpen: false,
        sidebarWidth: INITIAL_SIDEBAR_WIDTH,
        isSidebarCollapsed: false,

        // Filter actions
        setListingType: (type) => set({ listingType: type }),

        setLocation: (location, lat, lng) =>
          set({
            location,
            latitude: lat ?? null,
            longitude: lng ?? null,
          }),

        setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),

        setPropertyType: (type) => set({ propertyType: type }),

        setBedroomsRange: (min, max) =>
          set({ minBedrooms: min, maxBedrooms: max }),

        setBathroomsMin: (min) => set({ minBathrooms: min }),

        setAreaRange: (min, max) => set({ minArea: min, maxArea: max }),

        toggleAmenity: (amenity) =>
          set((state) => ({
            amenities: state.amenities.includes(amenity)
              ? state.amenities.filter((a) => a !== amenity)
              : [...state.amenities, amenity],
          })),

        setMapBounds: (bounds) => set({ mapBounds: bounds }),

        // Properties actions
        setProperties: (properties) => set({ properties }),
        setLoading: (isLoading) => set({ isLoading }),
        setFetching: (isFetching: boolean) => set({ isFetching }),
        setError: (error) => set({ error }),

        // Map actions
        setMapCenter: (center) => set({ mapCenter: center }),
        setMapZoom: (zoom) => set({ mapZoom: zoom }),

        // Selection actions
        selectProperty: (id) => set({ selectedPropertyId: id }),
        hoverProperty: (id) => set({ hoveredPropertyId: id }),

        // UI actions
        toggleFilters: () =>
          set((state) => ({ isFiltersOpen: !state.isFiltersOpen })),

        setSidebarWidth: (width) =>
          set({
            sidebarWidth: Math.max(
              MIN_SIDEBAR_WIDTH,
              Math.min(MAX_SIDEBAR_WIDTH, width),
            ),
          }),

        toggleSidebar: () =>
          set((state) => ({
            isSidebarCollapsed: !state.isSidebarCollapsed,
            sidebarWidth: !state.isSidebarCollapsed
              ? MIN_SIDEBAR_WIDTH
              : INITIAL_SIDEBAR_WIDTH,
          })),

        resetFilters: () =>
          set({
            ...initialFilters,
            isFiltersOpen: get().isFiltersOpen,
          }),

        // URL Sync
        setFiltersFromURL: (params) => {
          const updates: Partial<SearchFilters> = {};

          // Parse listing type
          const listingType = params.get('type');
          if (listingType) {
            updates.listingType = listingType.toUpperCase() as ListingType;
          }

          // Parse location
          const location = params.get('location');
          const lat = params.get('lat');
          const lng = params.get('lng');
          if (location) updates.location = location;
          if (lat) updates.latitude = parseFloat(lat);
          if (lng) updates.longitude = parseFloat(lng);

          // Parse price
          const minPrice = params.get('minPrice');
          const maxPrice = params.get('maxPrice');
          if (minPrice) updates.minPrice = parseFloat(minPrice);
          if (maxPrice) updates.maxPrice = parseFloat(maxPrice);

          // Parse property type
          const propertyType = params.get('propertyType');
          if (propertyType) {
            updates.propertyType = propertyType.toUpperCase() as PropertyType;
          }

          // Parse bedrooms
          const minBedrooms = params.get('minBedrooms');
          const maxBedrooms = params.get('maxBedrooms');
          if (minBedrooms) updates.minBedrooms = parseInt(minBedrooms);
          if (maxBedrooms) updates.maxBedrooms = parseInt(maxBedrooms);

          // Parse bathrooms
          const minBathrooms = params.get('minBathrooms');
          if (minBathrooms) updates.minBathrooms = parseInt(minBathrooms);

          // Parse area
          const minArea = params.get('minArea');
          const maxArea = params.get('maxArea');
          if (minArea) updates.minArea = parseFloat(minArea);
          if (maxArea) updates.maxArea = parseFloat(maxArea);

          // Parse amenities
          const amenities = params.get('amenities');
          if (amenities) {
            updates.amenities = amenities.split(',').filter(Boolean);
          }

          set(updates);
        },

        toURLParams: () => {
          const state = get();
          const params = new URLSearchParams();

          // Add non-null values
          if (state.listingType) {
            params.set('type', state.listingType.toLowerCase());
          }
          if (state.location) params.set('location', state.location);
          if (state.latitude) params.set('lat', state.latitude.toString());
          if (state.longitude) params.set('lng', state.longitude.toString());
          if (state.minPrice) params.set('minPrice', state.minPrice.toString());
          if (state.maxPrice) params.set('maxPrice', state.maxPrice.toString());
          if (state.propertyType) {
            params.set('propertyType', state.propertyType.toLowerCase());
          }
          if (state.minBedrooms) {
            params.set('minBedrooms', state.minBedrooms.toString());
          }
          if (state.maxBedrooms) {
            params.set('maxBedrooms', state.maxBedrooms.toString());
          }
          if (state.minBathrooms) {
            params.set('minBathrooms', state.minBathrooms.toString());
          }
          if (state.minArea) params.set('minArea', state.minArea.toString());
          if (state.maxArea) params.set('maxArea', state.maxArea.toString());
          if (state.amenities.length > 0) {
            params.set('amenities', state.amenities.join(','));
          }

          return params;
        },
      }),
      {
        name: 'search-filters',
        partialize: (state) => ({
          // Only persist search-related state
          listingType: state.listingType,
          location: state.location,
          latitude: state.latitude,
          longitude: state.longitude,
          propertyType: state.propertyType,
          minPrice: state.minPrice,
          maxPrice: state.maxPrice,
          minBedrooms: state.minBedrooms,
          maxBedrooms: state.maxBedrooms,
          minBathrooms: state.minBathrooms,
          minArea: state.minArea,
          maxArea: state.maxArea,
          amenities: state.amenities,
        }),
      },
    ),
  ),
);
