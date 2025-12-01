/**
 * Desktop Search Bar for Header
 * Compact inline search with type, location, price and search button
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Search } from 'lucide-react';
import { useSearchStore, type ListingType } from '@/stores/search-store';
import type { GeocodingResult } from '@/hooks/use-geocoding';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'SALE', label: 'Acheter' },
  { value: 'RENT', label: 'Louer' },
  { value: 'SHORT_TERM', label: 'Vacances' },
];

const SearchBarDesktop = () => {
  const router = useRouter();
  const {
    listingType,
    location,
    minPrice,
    setListingType,
    setLocation,
    setPriceRange,
    toURLParams,
  } = useSearchStore();

  const [localPrice, setLocalPrice] = useState<string>(
    minPrice?.toString() || '',
  );

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

  // Memoized search handler
  const handleSearch = useCallback(() => {
    const params = toURLParams();
    router.push(`/find?${params.toString()}`);
  }, [toURLParams, router]);

  // Handle enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 max-w-4xl w-full">
      {/* Listing Type Select */}
      <Select
        value={listingType || 'SALE'}
        onValueChange={(value) => setListingType(value as ListingType)}
      >
        <SelectTrigger className="w-[140px] border-0 focus:ring-0">
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
        onKeyPress={handleKeyPress}
        className="w-[140px] border-0 focus-visible:ring-0 shadow-none"
      />

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="sm"
        className="h-10 px-6 gap-2"
        aria-label="Rechercher"
      >
        <Search className="h-4 w-4" />
        <span className="hidden xl:inline">Rechercher</span>
      </Button>
    </div>
  );
};

export default SearchBarDesktop;
