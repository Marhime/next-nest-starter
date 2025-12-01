/**
 * Modern Search Bar for Home Page
 * With geocoding, listing type selector, and navigation to /find
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { Home, Building2, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchStore, type ListingType } from '@/stores/search-store';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { QueryProvider } from '../providers/QueryProvider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';

const LISTING_TYPES = [
  { value: 'SALE' as ListingType, label: 'Acheter', icon: Home },
  { value: 'RENT' as ListingType, label: 'Louer', icon: Building2 },
  { value: 'SHORT_TERM' as ListingType, label: 'Vacances', icon: Hotel },
];

export function ModernSearchBar({ className }: { className?: string }) {
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
      <div
        className={cn(
          'w-full bg-white rounded-md shadow-lg p-4 md:p-6',
          className,
        )}
      >
        <div className="hidden md:flex md:mb-6">
          <p className="font-bold text-2xl">Trouvez votre logement idéal</p>
        </div>
        {/* Modern Card Container */}
        <div className="md:flex md:items-end gap-4 md:gap-6">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex md:hidden md:flex-col md:gap-2">
              {/* Listing Type Selector */}
              <div className="flex md:hidden rounded-t-2xl w-full md:w-1/2 backdrop-blur-lg ">
                {LISTING_TYPES.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedType === value ? 'default' : 'link'}
                    className={cn(
                      'flex-1 not-visited: gap-2 transition-all duration-bold:text-sm',
                      selectedType === value ? 'shadow-lg ' : 'hover:bg-muted',
                    )}
                    onClick={() => setSelectedType(value)}
                  >
                    <Icon className="block h-4 w-4" />
                    <span className="block">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            {/* Listing Type Selector desktop */}
            <div className="hidden md:flex md:flex-col gap-2 ">
              <p className="hidden md:block font-bold text-sm">Je cherche à</p>
              <Select>
                <SelectTrigger className="">
                  <SelectValue placeholder="Type of property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel></SelectLabel>
                    {LISTING_TYPES.map(({ value, label, icon: Icon }) => (
                      <SelectItem
                        key={value}
                        value={value as string}
                        onClick={() => setSelectedType(value)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Search Input Group */}
            <div className=" flex flex-col gap-2">
              <p className="md:block font-bold text-sm">Lieu</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <LocationSearchBar
                    onLocationSelect={handleLocationSelect}
                    placeholder="Ville, quartier, adresse..."
                    defaultValue={searchLocation}
                    showCurrentLocationButton={false}
                    className=""
                  />
                </div>
              </div>
            </div>
            {/* Listing Price Selector desktop */}
            <div className="flex flex-col gap-2 ">
              <p className="md:block font-bold text-sm">Prix</p>
              <Input type="number" placeholder="2000" />
            </div>
          </div>
          <Button
            className="px-8 gap-2 h-12 shadow-lg hover:shadow-xl transition-all duration-200 text-md w-full md:w-auto mt-4 md:mt-0"
            onClick={handleSearch}
            onKeyPress={handleKeyPress}
          >
            <span className="md:inline">Rechercher</span>
          </Button>
        </div>
      </div>
    </QueryProvider>
  );
}
