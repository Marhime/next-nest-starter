/**
 * Find Layout
 * Unified layout with perfect URL sync + advanced filters
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { FiltersSummary } from '@/components/search/FiltersSummary';
import { useSearchStore } from '@/stores/search-store';
import { PropertyDetailsModal } from '@/components/property-search/PropertyDetailsModal';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DialogTitle } from '@radix-ui/react-dialog';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import Link from 'next/link';

const FindLayout = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasInitializedRef = useRef(false);

  const {
    isFiltersOpen,
    toggleFilters,
    setFiltersFromURL,
    toURLParams,
    setLocation,
    setMapCenter,
    setMapZoom,
    // Watch filter changes for URL sync
    listingType,
    location,
    latitude,
    longitude,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
  } = useSearchStore();

  // 1. Initial sync: URL → Store (only once on mount)
  useEffect(() => {
    if (!hasInitializedRef.current) {
      setFiltersFromURL(searchParams);

      // If location in URL, center map
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      if (lat && lng) {
        setMapCenter([parseFloat(lat), parseFloat(lng)]);
        setMapZoom(13);
      }

      hasInitializedRef.current = true;
    }
  }, [searchParams, setFiltersFromURL, setMapCenter, setMapZoom]);

  // 2. Continuous sync: Store → URL (when filters change)
  useEffect(() => {
    // Skip first render to avoid overwriting initial URL state
    if (!hasInitializedRef.current) return;

    const params = toURLParams();
    const newSearch = params.toString();
    const currentSearch = window.location.search.replace('?', '');

    // Only update if URL actually changed (prevents loops)
    if (newSearch !== currentSearch) {
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [
    listingType,
    location,
    latitude,
    longitude,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
    toURLParams,
  ]);

  const handleLocationSelect = (location: GeocodingResult) => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);

    // Update both stores
    setLocation(location.display_name, lat, lng);
    setMapCenter([lat, lng]);
    setMapZoom(13);

    // Update URL
    const params = toURLParams();
    router.push(`/find?${params.toString()}`);
  };

  // Count active filters
  const activeFiltersCount = Array.from(searchParams.entries()).filter(
    ([key]) => !['location', 'lat', 'lng', 'type'].includes(key),
  ).length;

  return (
    <>
      <QueryProvider>
        {/* Header with Search + Filters */}
        <header className="sticky top-0 z-[200] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-3 md:px-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Link
                  href={'/'}
                  className="text-black text-2xl font-bold col-span-2"
                >
                  MyLogo
                </Link>
              </div>
              <div className="flex items-center gap-3 flex-1">
                {/* Location Search */}
                <div className="flex-1 max-w-2xl">
                  <LocationSearchBar
                    onLocationSelect={handleLocationSelect}
                    placeholder="Rechercher une ville, adresse..."
                    defaultValue={location || ''}
                    showCurrentLocationButton={true}
                    className="h-11"
                  />
                </div>

                {/* Filters Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 relative"
                  onClick={toggleFilters}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="hidden sm:inline">Filtres</span>
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>
              <div className="flex-1 justify-end flex">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </header>
        {/* Active Filters Summary */}
        {/* <FiltersSummary /> */}

        {/* Main Content */}
        {children}

        <SidebarProvider>
          {/* Advanced Filters Sheet */}
          <Sheet open={isFiltersOpen} onOpenChange={toggleFilters}>
            <DialogTitle></DialogTitle>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <AdvancedFilters onClose={toggleFilters} />
            </SheetContent>
          </Sheet>

          {/* Property Details Modal */}
        </SidebarProvider>
      </QueryProvider>
    </>
  );
};

export default FindLayout;
