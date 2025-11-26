/**
 * Modern Search Bar for Home Page
 * With geocoding, listing type selector, and navigation to /find
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { Search, Home, Building2, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchStore, type ListingType } from '@/stores/search-store';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { QueryProvider } from '../providers/QueryProvider';

const LISTING_TYPES = [
  { value: 'SALE' as ListingType, label: 'Acheter', icon: Home },
  { value: 'RENT' as ListingType, label: 'Louer', icon: Building2 },
  { value: 'SHORT_TERM' as ListingType, label: 'Vacances', icon: Hotel },
];

export function ModernSearchBar() {
  const router = useRouter();
  const { listingType, location, setListingType, setLocation, toURLParams } =
    useSearchStore();

  const [selectedType, setSelectedType] = useState<ListingType>(
    listingType || 'SALE',
  );
  const [searchLocation, setSearchLocation] = useState<string>(location || '');
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  useEffect(() => {
    if (listingType) setSelectedType(listingType);
  }, [listingType]);

  const handleLocationSelect = (result: GeocodingResult) => {
    const locationName = result.display_name;
    setSearchLocation(locationName);
    setLocation(locationName, parseFloat(result.lat), parseFloat(result.lon));
    setIsLocationSelected(true);
  };

  const handleSearch = () => {
    // Update store with current selections
    setListingType(selectedType);

    // Small delay to ensure store is updated before generating URL
    setTimeout(() => {
      const params = toURLParams();
      // Navigate to /find with query params
      router.push(`/find?${params.toString()}`);
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isLocationSelected) {
      handleSearch();
    }
  };

  return (
    <QueryProvider>
      <div className="flex flex-col gap-4">
        <p className="mb-2 text-lg font-medium text-white">
          Recherchez une ville, un quartier, une adresse...
        </p>

        {/* Modern Card Container */}
        <div className="rounded-t-2xl">
          {/* Listing Type Selector */}
          <div className="flex rounded-t-2xl w-full md:w-1/2 backdrop-blur-lg">
            {LISTING_TYPES.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={selectedType === value ? 'default' : 'ghost'}
                className={cn(
                  'flex-1 not-visited: gap-2 transition-all duration-200  backdrop-blur-lg  rounded-t-2xl shadow-2xl text-lg',
                  selectedType === value
                    ? 'shadow-lg scale-105'
                    : 'hover:bg-muted',
                )}
                onClick={() => setSelectedType(value)}
              >
                <Icon className="block h-4 w-4" />
                <span className="block">{label}</span>
              </Button>
            ))}
          </div>

          {/* Search Input Group */}
          <div className="bg-white">
            <div className="flex gap-2 ">
              <div className="flex-1">
                <LocationSearchBar
                  onLocationSelect={handleLocationSelect}
                  placeholder="Ville, quartier, adresse..."
                  defaultValue={searchLocation}
                  showCurrentLocationButton={false}
                  className="h-12 border-2 focus-within:border-primary"
                />
              </div>

              <Button
                size="lg"
                className="px-8 gap-2 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleSearch}
                disabled={!isLocationSelected}
                onKeyPress={handleKeyPress}
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline">Rechercher</span>
              </Button>
            </div>
            {/* Quick Stats or Popular Searches (Optional)
            <div className="flex flex-wrap gap-2 mt-3 px-2">
              <span className="text-xs text-muted-foreground">
                Recherches populaires:
              </span>
              {['Paris', 'Lyon', 'Marseille', 'Bordeaux'].map((city) => (
                <button
                  key={city}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setSearchLocation(city);
                    setLocation(city, undefined, undefined);
                    setIsLocationSelected(true);
                  }}
                >
                  {city}
                </button>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </QueryProvider>
  );
}
