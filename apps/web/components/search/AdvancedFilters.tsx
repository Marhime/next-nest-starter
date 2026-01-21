/**
 * Advanced Filters Panel - Version Minimaliste
 * Cohérent avec le design de SearchBarHome
 */

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  useSearchStore,
  type PropertyType,
  type ListingType,
} from '@/stores/search-store';
import { X, Home, Building2, Landmark, ShoppingBag, Key } from 'lucide-react';
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
    setListingType,
    setPropertyType,
    resetFilters,
  } = useSearchStore();

  const activeFiltersCount =
    (listingType && listingType !== 'RENT' ? 1 : 0) +
    (propertyType && propertyType !== 'HOUSE' ? 1 : 0);

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
