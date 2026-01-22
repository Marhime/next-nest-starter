/**
 * Advanced Filters Panel - Version Minimaliste
 * Cohérent avec le design de SearchBarHome
 */

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useSearchStore,
  type PropertyType,
  type ListingType,
} from '@/stores/search-store';
import {
  X,
  Home,
  Building2,
  Landmark,
  ShoppingBag,
  Key,
  Bed,
  Bath,
  Maximize,
  Wifi,
  Car,
  Dumbbell,
  Wind,
  Droplet,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LISTING_TYPES = [
  { value: 'SALE', label: 'Acheter', icon: ShoppingBag },
  { value: 'RENT', label: 'Louer', icon: Key },
];

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'Maison', icon: Home },
  { value: 'APARTMENT', label: 'Appartement', icon: Building2 },
  { value: 'LAND', label: 'Terrain', icon: Landmark },
];

const AMENITIES = [
  { value: 'WIFI', label: 'WiFi', icon: Wifi },
  { value: 'PARKING', label: 'Parking', icon: Car },
  { value: 'POOL', label: 'Piscine', icon: Droplet },
  { value: 'GYM', label: 'Salle de sport', icon: Dumbbell },
  { value: 'AIR_CONDITIONING', label: 'Climatisation', icon: Wind },
  { value: 'SECURITY', label: 'Sécurité', icon: Shield },
];

interface AdvancedFiltersProps {
  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
}

export function AdvancedFilters({
  onClose,
  showHeader = true,
  className,
}: AdvancedFiltersProps) {
  const {
    listingType,
    propertyType,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
    setListingType,
    setPropertyType,
    setPriceRange,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    toggleAmenity,
    resetFilters,
  } = useSearchStore();

  const activeFiltersCount =
    (listingType && listingType !== 'RENT' ? 1 : 0) +
    (propertyType && propertyType !== 'HOUSE' ? 1 : 0) +
    (minPrice !== null && minPrice !== undefined ? 1 : 0) +
    (maxPrice !== null && maxPrice !== undefined ? 1 : 0) +
    (minBedrooms !== null && minBedrooms !== undefined ? 1 : 0) +
    (maxBedrooms !== null && maxBedrooms !== undefined ? 1 : 0) +
    (minBathrooms !== null && minBathrooms !== undefined ? 1 : 0) +
    (minArea !== null && minArea !== undefined ? 1 : 0) +
    (maxArea !== null && maxArea !== undefined ? 1 : 0) +
    (amenities && amenities.length > 0 ? amenities.length : 0);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {showHeader && (
        <>
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-xl font-bold">Filtres</h2>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}{' '}
                  actif{activeFiltersCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Filters Content - Minimaliste et cohérent */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Listing Type */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Type de transaction
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {LISTING_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setListingType(value as ListingType)}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all border-2',
                  listingType === value
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background border-border hover:border-primary/50',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Property Type */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Type de bien
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPropertyType(value as PropertyType)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all border-2',
                  propertyType === value
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background border-border hover:border-primary/50',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Prix</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="minPrice"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Minimum
              </Label>
              <div className="relative">
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    setPriceRange(val, maxPrice);
                  }}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  €
                </span>
              </div>
            </div>
            <div>
              <Label
                htmlFor="maxPrice"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Maximum
              </Label>
              <div className="relative">
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    setPriceRange(minPrice, val);
                  }}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  €
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bedrooms */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Chambres
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="minBedrooms"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Minimum
              </Label>
              <Select
                value={minBedrooms?.toString() ?? 'any'}
                onValueChange={(val) => {
                  const min = val === 'any' ? null : parseInt(val);
                  setBedroomsRange(min, maxBedrooms);
                }}
              >
                <SelectTrigger id="minBedrooms">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Indifférent</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="maxBedrooms"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Maximum
              </Label>
              <Select
                value={maxBedrooms?.toString() ?? 'any'}
                onValueChange={(val) => {
                  const max = val === 'any' ? null : parseInt(val);
                  setBedroomsRange(minBedrooms, max);
                }}
              >
                <SelectTrigger id="maxBedrooms">
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Indifférent</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bathrooms */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Bath className="h-4 w-4" />
            Salles de bain
          </Label>
          <Select
            value={minBathrooms?.toString() ?? 'any'}
            onValueChange={(val) => {
              const min = val === 'any' ? null : parseInt(val);
              setBathroomsMin(min);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Minimum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Indifférent</SelectItem>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Area */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Maximize className="h-4 w-4" />
            Surface
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="minArea"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Minimum
              </Label>
              <div className="relative">
                <Input
                  id="minArea"
                  type="number"
                  placeholder="Min"
                  value={minArea ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    setAreaRange(val, maxArea);
                  }}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  m²
                </span>
              </div>
            </div>
            <div>
              <Label
                htmlFor="maxArea"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Maximum
              </Label>
              <div className="relative">
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="Max"
                  value={maxArea ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    setAreaRange(minArea, val);
                  }}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  m²
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Équipements</Label>
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.map(({ value, label, icon: Icon }) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${value}`}
                  checked={amenities?.includes(value) ?? false}
                  onCheckedChange={() => toggleAmenity(value)}
                />
                <Label
                  htmlFor={`amenity-${value}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetFilters}
            disabled={activeFiltersCount === 0}
          >
            Réinitialiser
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Appliquer {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
