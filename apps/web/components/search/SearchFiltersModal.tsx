/**
 * Search Filters Modal/Drawer
 * - Mobile: Drawer (bottom sheet)
 * - Desktop: Dialog (centered modal)
 * - Shared state via search-store
 * - Reusable on home page and /find page
 */

'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import {
  Home,
  Key,
  MapPin,
  DollarSign,
  BedDouble,
  Maximize2,
} from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ListingType, PropertyType } from '@/hooks/use-create-property';

// SeLoger-style: Only SALE and RENT
const LISTING_TYPES = [
  { value: 'SALE' as ListingType, icon: Home },
  { value: 'RENT' as ListingType, icon: Key },
];

// Property types (keys only, labels from translations)
const PROPERTY_TYPE_KEYS = [
  'APARTMENT',
  'HOUSE',
  'STUDIO',
  'VILLA',
  'LAND',
  'TOWNHOUSE',
  'DUPLEX',
  'PENTHOUSE',
  'LOFT',
] as const;

interface SearchFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FiltersContentProps {
  t: ReturnType<typeof useTranslations>;
  selectedType: ListingType;
  setSelectedType: (v: ListingType) => void;
  searchLocation: string;
  handleLocationSelect: (r: GeocodingResult) => void;
  localMinPrice: string;
  setLocalMinPrice: (s: string) => void;
  localMaxPrice: string;
  setLocalMaxPrice: (s: string) => void;
  selectedPropertyType: PropertyType;
  setSelectedPropertyType: (v: PropertyType) => void;
  selectedMinBedrooms: string;
  setSelectedMinBedrooms: (s: string) => void;
  selectedMinBathrooms: string;
  setSelectedMinBathrooms: (s: string) => void;
  localMinArea: string;
  setLocalMinArea: (s: string) => void;
  localMaxArea: string;
  setLocalMaxArea: (s: string) => void;
}

export const FiltersContent: React.FC<FiltersContentProps> = ({
  t,
  selectedType,
  setSelectedType,
  searchLocation,
  handleLocationSelect,
  localMinPrice,
  setLocalMinPrice,
  localMaxPrice,
  setLocalMaxPrice,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedMinBedrooms,
  setSelectedMinBedrooms,
  selectedMinBathrooms,
  setSelectedMinBathrooms,
  localMinArea,
  setLocalMinArea,
  localMaxArea,
  setLocalMaxArea,
}: FiltersContentProps) => {
  return (
    <div className="overflow-y-auto p-4 md:px-0 space-y-4">
      {/* Type de transaction */}
      <div className="grid grid-cols-2 gap-2">
        {LISTING_TYPES.map(({ value, icon: Icon }) => {
          const isActive = selectedType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedType(value)}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">
                {value === 'SALE' ? t('buy') : t('rent')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Localisation */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('location')}</label>
        <LocationSearchBar
          onLocationSelect={handleLocationSelect}
          placeholder={t('locationPlaceholder')}
          defaultValue={searchLocation}
          className="h-9"
        />
      </div>

      {/* Prix adapté selon SALE ou RENT */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {selectedType === 'SALE' ? t('budgetBuy') : t('budgetRent')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder={t('minPrice')}
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder={t('maxPrice')}
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Type de propriété */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('propertyType')}</label>
        <Select
          value={selectedPropertyType || 'all'}
          onValueChange={(value) =>
            setSelectedPropertyType(
              value === 'all' ? 'HOUSE' : (value as PropertyType),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            {PROPERTY_TYPE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`propertyTypes.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chambres et Salles de bain (sauf pour terrains) */}
      {selectedPropertyType !== 'LAND' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('bedroomsBathrooms')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select
                value={selectedMinBedrooms}
                onValueChange={setSelectedMinBedrooms}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('bedrooms')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={selectedMinBathrooms}
                onValueChange={setSelectedMinBathrooms}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('bathrooms')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Surface pour les terrains */}
      {selectedPropertyType === 'LAND' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('area')}</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={t('minArea')}
              value={localMinArea}
              onChange={(e) => setLocalMinArea(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t('maxArea')}
              value={localMaxArea}
              onChange={(e) => setLocalMaxArea(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export function SearchFiltersModal({
  open,
  onOpenChange,
}: SearchFiltersModalProps) {
  const t = useTranslations('SearchFilters');
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const {
    listingType,
    location,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    setListingType,
    setLocation,
    setPriceRange,
    setPropertyType,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    toURLParams,
  } = useSearchStore();

  // Local state for inputs (sync with store)
  const [selectedType, setSelectedType] = useState<ListingType>(
    listingType || 'SALE',
  );
  const [searchLocation, setSearchLocation] = useState<string>(location || '');
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    minPrice?.toString() || '',
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    maxPrice?.toString() || '',
  );
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<PropertyType>(propertyType);
  const [selectedMinBedrooms, setSelectedMinBedrooms] = useState<string>(
    minBedrooms?.toString() || 'all',
  );
  const [selectedMinBathrooms, setSelectedMinBathrooms] = useState<string>(
    minBathrooms?.toString() || 'all',
  );
  const [localMinArea, setLocalMinArea] = useState<string>(
    minArea?.toString() || '',
  );
  const [localMaxArea, setLocalMaxArea] = useState<string>(
    maxArea?.toString() || '',
  );

  // Sync local state with store when modal opens
  useEffect(() => {
    if (open) {
      setSelectedType(listingType || 'SALE');
      setSearchLocation(location || '');
      setLocalMinPrice(minPrice?.toString() || '');
      setLocalMaxPrice(maxPrice?.toString() || '');
      setSelectedPropertyType(propertyType);
      setSelectedMinBedrooms(minBedrooms?.toString() || 'all');
      setSelectedMinBathrooms(minBathrooms?.toString() || 'all');
      setLocalMinArea(minArea?.toString() || '');
      setLocalMaxArea(maxArea?.toString() || '');
    }
  }, [
    open,
    listingType,
    location,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    minBathrooms,
    minArea,
    maxArea,
  ]);

  const handleLocationSelect = useCallback(
    (result: GeocodingResult) => {
      const locationName = result.display_name;
      setSearchLocation(locationName);
      setLocation(locationName, parseFloat(result.lat), parseFloat(result.lon));
    },
    [setLocation],
  );

  const handleSearch = useCallback(() => {
    // Update store with all selections
    setListingType(selectedType);
    setPriceRange(
      localMinPrice ? parseFloat(localMinPrice) : null,
      localMaxPrice ? parseFloat(localMaxPrice) : null,
    );
    setPropertyType(selectedPropertyType);
    setBedroomsRange(
      selectedMinBedrooms === 'all' ? null : parseInt(selectedMinBedrooms),
      null,
    );
    setBathroomsMin(
      selectedMinBathrooms === 'all' ? null : parseInt(selectedMinBathrooms),
    );
    setAreaRange(
      localMinArea ? parseFloat(localMinArea) : null,
      localMaxArea ? parseFloat(localMaxArea) : null,
    );

    // Close modal
    onOpenChange(false);

    // Navigate to /find if on home page
    if (!pathname?.includes('/find')) {
      setTimeout(() => {
        const params = toURLParams();
        router.push(`/find?${params.toString()}`);
      }, 100);
    }
    // If already on /find, the usePropertyData hook will refetch automatically
  }, [
    selectedType,
    localMinPrice,
    localMaxPrice,
    selectedPropertyType,
    selectedMinBedrooms,
    selectedMinBathrooms,
    localMinArea,
    localMaxArea,
    setListingType,
    setPriceRange,
    setPropertyType,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    onOpenChange,
    pathname,
    toURLParams,
    router,
  ]);

  // Mobile: Drawer
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{t('title')}</DrawerTitle>
            <DrawerDescription>{t('description')}</DrawerDescription>
          </DrawerHeader>

          <FiltersContent
            t={t}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            searchLocation={searchLocation}
            handleLocationSelect={handleLocationSelect}
            localMinPrice={localMinPrice}
            setLocalMinPrice={setLocalMinPrice}
            localMaxPrice={localMaxPrice}
            setLocalMaxPrice={setLocalMaxPrice}
            selectedPropertyType={selectedPropertyType}
            setSelectedPropertyType={setSelectedPropertyType}
            selectedMinBedrooms={selectedMinBedrooms}
            setSelectedMinBedrooms={setSelectedMinBedrooms}
            selectedMinBathrooms={selectedMinBathrooms}
            setSelectedMinBathrooms={setSelectedMinBathrooms}
            localMinArea={localMinArea}
            setLocalMinArea={setLocalMinArea}
            localMaxArea={localMaxArea}
            setLocalMaxArea={setLocalMaxArea}
          />

          <DrawerFooter className="pt-2">
            <Button className="w-full" onClick={handleSearch}>
              {t('search')}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog (Modal)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <FiltersContent
          t={t}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          searchLocation={searchLocation}
          handleLocationSelect={handleLocationSelect}
          localMinPrice={localMinPrice}
          setLocalMinPrice={setLocalMinPrice}
          localMaxPrice={localMaxPrice}
          setLocalMaxPrice={setLocalMaxPrice}
          selectedPropertyType={selectedPropertyType}
          setSelectedPropertyType={setSelectedPropertyType}
          selectedMinBedrooms={selectedMinBedrooms}
          setSelectedMinBedrooms={setSelectedMinBedrooms}
          selectedMinBathrooms={selectedMinBathrooms}
          setSelectedMinBathrooms={setSelectedMinBathrooms}
          localMinArea={localMinArea}
          setLocalMinArea={setLocalMinArea}
          localMaxArea={localMaxArea}
          setLocalMaxArea={setLocalMaxArea}
        />

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSearch}>{t('search')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
