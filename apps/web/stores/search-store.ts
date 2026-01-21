/**
 * Unified Property Search Store
 * Complete state management: filters, properties, map, UI, URL sync
 */

import { ListingType, PropertyType } from '@/hooks/use-create-property';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// SeLoger-style: Only long-term real estate (Achat/Location)

// Property interface (from API)
export interface Property {
  id: number;
  userId: string;
  propertyType: string;
  listingType?: string;
  title: string;
  description?: string;
  status: string;
  price: string;
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

// Lightweight marker data for map
export interface PropertyMarker {
  id: number;
  latitude: number;
  longitude: number;
  price: string;
  propertyType: string;
}

// Main store state
export interface SearchState extends SearchFilters {
  // Map markers (lightweight data, no pagination) - SINGLE SOURCE OF TRUTH
  mapMarkers: PropertyMarker[];
  isMarkersLoading: boolean;

  // Pagination state (for list display, derived from markers)
  currentPage: number;
  itemsPerPage: number;

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
  isMobileDrawerOpen: boolean;

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

  // Pagination Actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Map Markers Actions (Single Source of Truth)
  setMapMarkers: (markers: PropertyMarker[]) => void;
  setMarkersLoading: (loading: boolean) => void;

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
  setMobileDrawerOpen: (open: boolean) => void;
  resetFilters: () => void;

  // URL Sync
  setFiltersFromURL: (params: URLSearchParams) => void;
  toURLParams: () => URLSearchParams;
}

const initialFilters: SearchFilters = {
  location: 'Puerto Escondido, Oaxaca',
  latitude: 15.8671,
  longitude: -97.0524,
  minPrice: null,
  maxPrice: null,
  listingType: 'RENT',
  propertyType: 'HOUSE',
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

        // Map markers (SINGLE SOURCE OF TRUTH)
        mapMarkers: [],
        isMarkersLoading: false,

        // Pagination
        currentPage: 1,
        itemsPerPage: 20,

        // Map state - Centered on Puerto Escondido
        mapCenter: [15.8671, -97.0524] as [number, number],
        mapZoom: 13,

        // Initial state - Selection
        selectedPropertyId: null,
        hoveredPropertyId: null,

        // Initial state - UI
        isFiltersOpen: false,
        sidebarWidth: INITIAL_SIDEBAR_WIDTH,
        isSidebarCollapsed: false,
        isMobileDrawerOpen: true,

        // Filter actions (reset to page 1 when filters change)
        setListingType: (type) => set({ listingType: type, currentPage: 1 }),

        setLocation: (location, lat, lng) =>
          set({
            location,
            latitude: lat ?? null,
            longitude: lng ?? null,
            currentPage: 1,
          }),

        setPriceRange: (min, max) =>
          set({ minPrice: min, maxPrice: max, currentPage: 1 }),

        setPropertyType: (type) => set({ propertyType: type, currentPage: 1 }),

        setBedroomsRange: (min, max) =>
          set({ minBedrooms: min, maxBedrooms: max, currentPage: 1 }),

        setBathroomsMin: (min) => set({ minBathrooms: min, currentPage: 1 }),

        setAreaRange: (min, max) =>
          set({ minArea: min, maxArea: max, currentPage: 1 }),

        toggleAmenity: (amenity) =>
          set((state) => ({
            amenities: state.amenities.includes(amenity)
              ? state.amenities.filter((a) => a !== amenity)
              : [...state.amenities, amenity],
            currentPage: 1,
          })),

        // setMapBounds resets page to 1 when map moves significantly (new search area)
        // BUT NOT for minor adjustments or initial load from URL
        setMapBounds: (bounds) => {
          const currentBounds = get().mapBounds;

          if (!currentBounds || !bounds) {
            // First time setting bounds (initial load)
            set({ mapBounds: bounds });
            return;
          }

          // Calculate if bounds changed significantly (>10% center movement or >20% zoom change)
          const latDiff = Math.abs(currentBounds.north - currentBounds.south);
          const lngDiff = Math.abs(currentBounds.east - currentBounds.west);

          const newLatDiff = Math.abs(bounds.north - bounds.south);

          const latChange = Math.abs(
            (currentBounds.north + currentBounds.south) / 2 -
              (bounds.north + bounds.south) / 2,
          );
          const lngChange = Math.abs(
            (currentBounds.east + currentBounds.west) / 2 -
              (bounds.east + bounds.west) / 2,
          );

          // Reset page if:
          // 1. Center moved significantly (>10% of current span)
          // 2. Zoom level changed significantly (>20% difference in span)
          const centerMoved =
            latChange > latDiff * 0.1 || lngChange > lngDiff * 0.1;
          const zoomChanged = Math.abs(newLatDiff - latDiff) > latDiff * 0.2;

          if (centerMoved || zoomChanged) {
            set({ mapBounds: bounds, currentPage: 1 });
          } else {
            set({ mapBounds: bounds });
          }
        },

        // Pagination actions
        setCurrentPage: (page) => set({ currentPage: page }),
        setItemsPerPage: (items) => set({ itemsPerPage: items }),

        // Map markers actions (Single Source of Truth)
        setMapMarkers: (markers) => set({ mapMarkers: markers }),
        setMarkersLoading: (loading) => set({ isMarkersLoading: loading }),

        // Map state actions
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

        setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),

        resetFilters: () =>
          set({
            ...initialFilters,
            isFiltersOpen: get().isFiltersOpen,
          }),

        // URL Sync
        setFiltersFromURL: (params) => {
          const updates: Partial<SearchFilters> & { currentPage?: number } = {};

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

          // Parse page number
          const page = params.get('page');
          if (page) {
            updates.currentPage = parseInt(page);
          }

          // Parse map zoom
          const zoom = params.get('zoom');
          if (zoom) {
            set({ mapZoom: parseFloat(zoom) });
          }

          // Parse map bounds
          const bounds = params.get('bounds');
          if (bounds) {
            try {
              const parsedBounds = JSON.parse(bounds) as MapBounds;
              updates.mapBounds = parsedBounds;
            } catch (e) {
              console.error('Failed to parse bounds from URL:', e);
            }
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
          // Add page if not 1
          if (state.currentPage > 1) {
            params.set('page', state.currentPage.toString());
          }
          // Add map zoom
          if (state.mapZoom) {
            params.set('zoom', state.mapZoom.toString());
          }
          // Add map bounds if available
          if (state.mapBounds) {
            params.set('bounds', JSON.stringify(state.mapBounds));
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
