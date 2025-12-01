/**
 * Search Bar for /find Page
 * Compact search bar with filters button for desktop and mobile
 * Displays in header on desktop, above map on mobile
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchStore, type ListingType } from '@/stores/search-store';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AdvancedFilters } from './AdvancedFilters';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'SALE', label: 'Acheter' },
  { value: 'RENT', label: 'Louer' },
  { value: 'SHORT_TERM', label: 'Vacances' },
];

interface SearchBarFindProps {
  className?: string;
}

export function SearchBarFind({ className }: SearchBarFindProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    listingType,
    location,
    minPrice,
    propertyType,
    minBedrooms,
    minBathrooms,
    amenities,
    setListingType,
    setLocation,
    setPriceRange,
  } = useSearchStore();

  const [localPrice, setLocalPrice] = useState<string>(
    minPrice?.toString() || '',
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Update local price when store changes
  useEffect(() => {
    setLocalPrice(minPrice?.toString() || '');
  }, [minPrice]);

  // Memoized location select handler
  const handleLocationSelect = useCallback(
    (result: GeocodingResult) => {
      const locationName = result.display_name;
      setLocation(locationName, parseFloat(result.lat), parseFloat(result.lon));
    },
    [setLocation],
  );

  // Memoized price change handler
  const handlePriceChange = useCallback(
    (value: string) => {
      setLocalPrice(value);
      const numValue = value ? parseFloat(value) : null;
      setPriceRange(numValue, null);
    },
    [setPriceRange],
  );

  // Count active filters (excluding main search fields)
  const activeFiltersCount =
    (propertyType ? 1 : 0) +
    (minBedrooms ? 1 : 0) +
    (minBathrooms ? 1 : 0) +
    amenities.length;

  // Desktop: Inline search bar
  if (isDesktop) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 w-full',
          className,
        )}
      >
        {/* Listing Type Select */}
        <Select
          value={listingType || 'SALE'}
          onValueChange={(value) => setListingType(value as ListingType)}
        >
          <SelectTrigger className="w-[130px] border-0 focus:ring-0">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {LISTING_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value as string}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Location Search */}
        <div className="flex-1 min-w-0">
          <LocationSearchBar
            onLocationSelect={handleLocationSelect}
            placeholder="Ville, quartier, adresse..."
            defaultValue={location || ''}
            showCurrentLocationButton={false}
            className="border-0 focus-visible:ring-0 shadow-none"
          />
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Price Input */}
        <Input
          type="number"
          placeholder="Prix max"
          value={localPrice}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-[120px] border-0 focus-visible:ring-0 shadow-none"
        />

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Filters Button - Desktop Modal */}
        <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 relative"
              aria-label="Filtres avancés"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Filtres de recherche</DialogTitle>
              <DialogDescription>
                Affinez votre recherche avec des filtres avancés
              </DialogDescription>
            </DialogHeader>
            <AdvancedFilters
              onClose={() => setIsFiltersOpen(false)}
              showHeader={true}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Mobile: Compact bar with drawer for filters
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-white rounded-lg shadow-md p-2',
        className,
      )}
    >
      {/* Listing Type Select - Compact */}
      <Select
        value={listingType || 'SALE'}
        onValueChange={(value) => setListingType(value as ListingType)}
      >
        <SelectTrigger className="w-[110px] border-0 focus:ring-0 text-sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {LISTING_TYPES.map(({ value, label }) => (
            <SelectItem key={value} value={value as string}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Divider */}
      <div className="h-8 w-px bg-gray-200" />

      {/* Location Search - Compact */}
      <div className="flex-1 min-w-0">
        <LocationSearchBar
          onLocationSelect={handleLocationSelect}
          placeholder="Lieu..."
          defaultValue={location || ''}
          showCurrentLocationButton={false}
          className="border-0 focus-visible:ring-0 shadow-none text-sm"
        />
      </div>

      {/* Filters Button - Mobile Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative shrink-0"
            aria-label="Filtres"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Filtres de recherche</SheetTitle>
            <SheetDescription>
              Affinez votre recherche avec des filtres avancés
            </SheetDescription>
          </SheetHeader>
          <AdvancedFilters
            onClose={() => setIsFiltersOpen(false)}
            showHeader={true}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
