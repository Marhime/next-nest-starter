/**
 * Search Filters Modal/Drawer
 * - Mobile: Drawer (bottom sheet)
 * - Desktop: Dialog (centered modal)
 * - Shared state via search-store
 * - Reusable on home page and /find page
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { Home, Key } from 'lucide-react';
import {
  useSearchStore,
  type ListingType,
  type PropertyType,
} from '@/stores/search-store';
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

// SeLoger-style: Only SALE and RENT
const LISTING_TYPES = [
  { value: 'SALE' as ListingType, label: 'Acheter', icon: Home },
  { value: 'RENT' as ListingType, label: 'Louer', icon: Key },
];

// Property types with French labels
const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'TOWNHOUSE', label: 'Maison de ville' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'LOFT', label: 'Loft' },
];

interface SearchFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchFiltersModal({
  open,
  onOpenChange,
}: SearchFiltersModalProps) {
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

  // Shared content for both Drawer and Dialog
  const FiltersContent = () => (
    <div className="overflow-y-auto px-4 pb-4 space-y-6">
      {/* Type de transaction */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Je cherche à</label>
        <div className="grid grid-cols-2 gap-2">
          {LISTING_TYPES.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              type="button"
              variant={selectedType === value ? 'default' : 'outline'}
              className="flex items-center justify-center gap-2 h-12"
              onClick={() => setSelectedType(value)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Localisation</label>
        <LocationSearchBar
          onLocationSelect={handleLocationSelect}
          placeholder="Paris, Lyon, Marseille..."
          defaultValue={searchLocation}
          showCurrentLocationButton={true}
        />
      </div>

      {/* Prix adapté selon SALE ou RENT */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">
          {selectedType === 'SALE' ? "Budget d'achat" : 'Budget mensuel'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder={selectedType === 'SALE' ? '100 000 €' : '500 €'}
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {selectedType === 'SALE' ? 'Min' : 'Min/mois'}
            </p>
          </div>
          <div>
            <Input
              type="number"
              placeholder={selectedType === 'SALE' ? '500 000 €' : '2 000 €'}
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {selectedType === 'SALE' ? 'Max' : 'Max/mois'}
            </p>
          </div>
        </div>
      </div>

      {/* Type de propriété */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Type de bien</label>
        <Select
          value={selectedPropertyType || 'all'}
          onValueChange={(value) =>
            setSelectedPropertyType(
              value === 'all' ? null : (value as PropertyType),
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PROPERTY_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chambres et Salles de bain (sauf pour terrains) */}
      {selectedPropertyType !== 'LAND' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Chambres</label>
            <Select
              value={selectedMinBedrooms}
              onValueChange={setSelectedMinBedrooms}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Salles de bain</label>
            <Select
              value={selectedMinBathrooms}
              onValueChange={setSelectedMinBathrooms}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Surface pour les terrains */}
      {selectedPropertyType === 'LAND' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">Surface</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min (m²)"
                value={localMinArea}
                onChange={(e) => setLocalMinArea(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max (m²)"
                value={localMaxArea}
                onChange={(e) => setLocalMaxArea(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Drawer
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Filtres de recherche</DrawerTitle>
            <DrawerDescription>
              Affinez votre recherche pour trouver le bien idéal
            </DrawerDescription>
          </DrawerHeader>

          <FiltersContent />

          <DrawerFooter className="pt-4 border-t">
            <Button className="w-full h-12" size="lg" onClick={handleSearch}>
              Rechercher
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
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
          <DialogTitle>Filtres de recherche</DialogTitle>
          <DialogDescription>
            Affinez votre recherche pour trouver le bien idéal
          </DialogDescription>
        </DialogHeader>

        <FiltersContent />

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSearch}>Rechercher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
