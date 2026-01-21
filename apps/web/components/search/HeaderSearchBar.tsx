'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSearchStore } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { SlidersHorizontal } from 'lucide-react';
import type { GeocodingResult } from '@/hooks/use-geocoding';

export function HeaderSearchBar() {
  const t = useTranslations('SearchFilters');
  const pathname = usePathname();

  const {
    location,
    setLocation,
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
    setLocation(locationName, parseFloat(result.lat), parseFloat(result.lon));
  };

  return (
    <>
      {/* Desktop Version - Location Input + Filters Button */}
      <div className="hidden lg:flex items-center gap-3 max-w-2xl mx-4">
        <div className="flex-1">
          <LocationSearchBar
            onLocationSelect={handleLocationSelect}
            placeholder={t('locationPlaceholder') || 'Localisation'}
            defaultValue={location || ''}
            className="h-10"
          />
        </div>
        <Button
          variant="secondary"
          onClick={toggleFilters}
          className="relative h-10 shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {t('filters') || 'Filtres'}
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 px-1.5 min-w-[20px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Version - Just Filters Button */}
      <Button
        variant="outline"
        onClick={toggleFilters}
        className="lg:hidden relative h-9"
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
    </>
  );
}
