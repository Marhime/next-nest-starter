'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSearchStore } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { SavedSearchButton } from '@/components/search/SavedSearchButton';
import { SavedSearchesList } from '@/components/search/SavedSearchesList';
import { SlidersHorizontal, Home, Key } from 'lucide-react';
import type { GeocodingResult } from '@/hooks/use-geocoding';

export function HeaderSearchBar() {
  const t = useTranslations('SearchFilters');
  const pathname = usePathname();

  const {
    listingType,
    setListingType,
    location,
    setLocation,
    setMapCenter,
    setMapZoom,
    toggleFilters,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    minBathrooms,
    amenities,
  } = useSearchStore();

  // Only show on /find page
  const isOnFindPage = pathname?.includes('/find');
  if (!isOnFindPage) return null;

  // Count active filters (excluding location and listingType which are always visible)
  const activeFiltersCount = [
    minPrice !== null && minPrice !== undefined,
    maxPrice !== null && maxPrice !== undefined,
    propertyType && propertyType !== 'HOUSE',
    minBedrooms !== null && minBedrooms !== undefined,
    minBathrooms !== null && minBathrooms !== undefined,
    amenities && amenities.length > 0,
  ].filter(Boolean).length;

  const handleLocationSelect = (result: GeocodingResult) => {
    const locationName = result.display_name;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    console.log('📍 HeaderSearchBar - Location selected:', {
      name: locationName,
      lat,
      lng,
    });

    // Update location in store
    setLocation(locationName, lat, lng);

    // Re-center map immediately with appropriate zoom
    setMapCenter([lat, lng]);
    setMapZoom(13); // Good zoom level for city/neighborhood view

    console.log('✅ Map center and zoom updated');
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-1">
        {/* Listing Type Toggle */}
        <div className="flex gap-1 shrink-0">
          <Button
            variant={listingType === 'SALE' ? 'default' : 'outline'}
            onClick={() => setListingType('SALE')}
            className="h-9 xl:h-10 px-3"
            size="sm"
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Acheter</span>
          </Button>
          <Button
            variant={listingType === 'RENT' ? 'default' : 'outline'}
            onClick={() => setListingType('RENT')}
            className="h-9 xl:h-10 px-3"
            size="sm"
          >
            <Key className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Louer</span>
          </Button>
        </div>

        {/* Location Search */}
        <div className="flex-1 max-w-md">
          <LocationSearchBar
            key={location || 'empty'} // Force remount when location changes - proper React pattern
            onLocationSelect={handleLocationSelect}
            placeholder={t('locationPlaceholder') || 'Localisation'}
            defaultValue={location || ''}
            className="h-9 xl:h-10"
          />
        </div>

        {/* Saved Searches Dropdown */}
        <div className="hidden md:block">
          <SavedSearchesList variant="dropdown" />
        </div>

        {/* Save Current Search Button */}
        <SavedSearchButton
          variant="outline"
          size="sm"
          showLabel={false}
          className="h-9 xl:h-10"
        />

        {/* Filters Button */}
        <Button
          variant="outline"
          onClick={toggleFilters}
          className="relative h-9 xl:h-10 shrink-0"
          size="sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-1.5 h-4 px-1 min-w-[16px] text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    </>
  );
}
