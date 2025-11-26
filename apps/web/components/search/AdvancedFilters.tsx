/**
 * Advanced Filters Panel
 * Reusable filter component with all search options
 */

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useSearchStore, type PropertyType } from '@/stores/search-store';
import { X, Home, Building2, Castle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement', icon: Building2 },
  { value: 'HOUSE', label: 'Maison', icon: Home },
  { value: 'VILLA', label: 'Villa', icon: Castle },
  { value: 'STUDIO', label: 'Studio', icon: Building2 },
];

const AMENITIES = [
  { value: 'parking', label: 'Parking' },
  { value: 'garage', label: 'Garage' },
  { value: 'garden', label: 'Jardin' },
  { value: 'pool', label: 'Piscine' },
  { value: 'terrace', label: 'Terrasse' },
  { value: 'balcony', label: 'Balcon' },
  { value: 'elevator', label: 'Ascenseur' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'air_conditioning', label: 'Climatisation' },
  { value: 'heating', label: 'Chauffage' },
];

const BEDROOMS_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOMS_OPTIONS = [1, 2, 3, 4];

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
    propertyType,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
    setPropertyType,
    setPriceRange,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    toggleAmenity,
    resetFilters,
  } = useSearchStore();

  const activeFiltersCount =
    (propertyType ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (minBedrooms || maxBedrooms ? 1 : 0) +
    (minBathrooms ? 1 : 0) +
    (minArea || maxArea ? 1 : 0) +
    amenities.length;

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

      {/* Filters Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Property Type */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Type de bien
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={propertyType === value ? 'default' : 'outline'}
                className={cn(
                  'justify-start gap-2 h-auto py-3',
                  propertyType === value && 'border-2 border-primary',
                )}
                onClick={() =>
                  setPropertyType(
                    propertyType === value ? null : (value as PropertyType),
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Prix</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="minPrice"
                className="text-sm text-muted-foreground"
              >
                Min (€)
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice || ''}
                onChange={(e) =>
                  setPriceRange(
                    e.target.value ? parseFloat(e.target.value) : null,
                    maxPrice,
                  )
                }
              />
            </div>
            <div>
              <Label
                htmlFor="maxPrice"
                className="text-sm text-muted-foreground"
              >
                Max (€)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Illimité"
                value={maxPrice || ''}
                onChange={(e) =>
                  setPriceRange(
                    minPrice,
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Bedrooms */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Chambres</Label>
          <div className="flex flex-wrap gap-2">
            {BEDROOMS_OPTIONS.map((num) => (
              <Button
                key={num}
                variant={minBedrooms === num ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'w-12',
                  minBedrooms === num && 'border-2 border-primary',
                )}
                onClick={() => {
                  if (minBedrooms === num) {
                    setBedroomsRange(null, maxBedrooms);
                  } else {
                    setBedroomsRange(num, maxBedrooms);
                  }
                }}
              >
                {num}+
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bathrooms */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Salles de bain
          </Label>
          <div className="flex flex-wrap gap-2">
            {BATHROOMS_OPTIONS.map((num) => (
              <Button
                key={num}
                variant={minBathrooms === num ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'w-12',
                  minBathrooms === num && 'border-2 border-primary',
                )}
                onClick={() =>
                  setBathroomsMin(minBathrooms === num ? null : num)
                }
              >
                {num}+
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Area */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Surface (m²)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="minArea"
                className="text-sm text-muted-foreground"
              >
                Min
              </Label>
              <Input
                id="minArea"
                type="number"
                placeholder="0"
                value={minArea || ''}
                onChange={(e) =>
                  setAreaRange(
                    e.target.value ? parseFloat(e.target.value) : null,
                    maxArea,
                  )
                }
              />
            </div>
            <div>
              <Label
                htmlFor="maxArea"
                className="text-sm text-muted-foreground"
              >
                Max
              </Label>
              <Input
                id="maxArea"
                type="number"
                placeholder="Illimité"
                value={maxArea || ''}
                onChange={(e) =>
                  setAreaRange(
                    minArea,
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Équipements
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.map((amenity) => (
              <div key={amenity.value} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.value}
                  checked={amenities.includes(amenity.value)}
                  onCheckedChange={() => toggleAmenity(amenity.value)}
                />
                <label
                  htmlFor={amenity.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenity.label}
                </label>
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
