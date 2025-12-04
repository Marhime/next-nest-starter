/**
 * Modern Search Bar for Home Page
 * With geocoding, listing type selector, and navigation to /find
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import { Home, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSearchStore,
  type ListingType,
  type PropertyType,
} from '@/stores/search-store';
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '../ui/input';

// SeLoger-style: Only SALE and RENT (no SHORT_TERM/Airbnb)
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

export function ModernSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const { listingType, location, setListingType, setLocation, toURLParams } =
    useSearchStore();
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

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
          <div className="flex flex-1 flex-row md:items-center gap-4 md:gap-6">
            <p className="text-sm capitalize">
              {selectedType?.toLocaleLowerCase()}
            </p>
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
                  <Input
                    onClick={() => {
                      setDrawerIsOpen(true);
                    }}
                    type="text"
                    placeholder="Paris, Lyon, Marseille..."
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
      <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Rechercher un logement</DrawerTitle>
            <DrawerDescription>
              Affinez votre recherche pour trouver le bien idéal
            </DrawerDescription>
          </DrawerHeader>

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
                    placeholder={
                      selectedType === 'SALE' ? '100 000 €' : '500 €'
                    }
                    value={useSearchStore.getState().minPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseFloat(e.target.value)
                        : null;
                      useSearchStore
                        .getState()
                        .setPriceRange(
                          value,
                          useSearchStore.getState().maxPrice,
                        );
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedType === 'SALE' ? 'Min' : 'Min/mois'}
                  </p>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder={
                      selectedType === 'SALE' ? '500 000 €' : '2 000 €'
                    }
                    value={useSearchStore.getState().maxPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseFloat(e.target.value)
                        : null;
                      useSearchStore
                        .getState()
                        .setPriceRange(
                          useSearchStore.getState().minPrice,
                          value,
                        );
                    }}
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
                value={useSearchStore.getState().propertyType || 'all'}
                onValueChange={(value) => {
                  const propertyType =
                    value === 'all' ? null : (value as PropertyType);
                  useSearchStore.getState().setPropertyType(propertyType);
                }}
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
            {useSearchStore.getState().propertyType !== 'LAND' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Chambres</label>
                  <Select
                    value={
                      useSearchStore.getState().minBedrooms?.toString() || 'all'
                    }
                    onValueChange={(value) => {
                      const min = value === 'all' ? null : parseInt(value);
                      useSearchStore.getState().setBedroomsRange(min, null);
                    }}
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
                  <label className="text-sm font-semibold">
                    Salles de bain
                  </label>
                  <Select
                    value={
                      useSearchStore.getState().minBathrooms?.toString() ||
                      'all'
                    }
                    onValueChange={(value) => {
                      const min = value === 'all' ? null : parseInt(value);
                      useSearchStore.getState().setBathroomsMin(min);
                    }}
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
            {useSearchStore.getState().propertyType === 'LAND' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">Surface</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min (m²)"
                      value={useSearchStore.getState().minArea || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        useSearchStore
                          .getState()
                          .setAreaRange(
                            value,
                            useSearchStore.getState().maxArea,
                          );
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max (m²)"
                      value={useSearchStore.getState().maxArea || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        useSearchStore
                          .getState()
                          .setAreaRange(
                            useSearchStore.getState().minArea,
                            value,
                          );
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="pt-4 border-t">
            <Button
              className="w-full h-12"
              size="lg"
              onClick={() => {
                handleSearch();
                setDrawerIsOpen(false);
              }}
            >
              Rechercher
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </QueryProvider>
  );
}
