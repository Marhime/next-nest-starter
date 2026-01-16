/**
 * Property Filters Component
 * Advanced filters with morphing animation using clip-path
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PropertyType } from '@/hooks/use-create-property';

const PROPERTY_TYPES = [
  'Appartement',
  'Maison',
  'Studio',
  'Loft',
  'Duplex',
  'Villa',
  'Château',
  'Terrain',
];

interface PropertyFiltersProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function PropertyFilters({ onOpenChange }: PropertyFiltersProps) {
  const {
    priceRange,
    setPriceRange,
    propertyTypes,
    setPropertyTypes,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    resetFilters,
  } = usePropertySearchStore();

  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync local state with store
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  // Notify parent and handle click outside
  useEffect(() => {
    onOpenChange?.(isOpen);

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const handleApplyFilters = () => {
    setPriceRange(localPriceRange);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    resetFilters();
    setLocalPriceRange([0, 1000000]);
  };

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t: PropertyType) => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const activeFiltersCount =
    propertyTypes.length +
    (bedrooms !== null ? 1 : 0) +
    (bathrooms !== null ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full justify-start gap-2 relative transition-all duration-300',
          isOpen && 'opacity-0 pointer-events-none scale-95',
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="ml-auto h-5 w-5 p-0 flex items-center justify-center"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Floating Filter Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={cn(
            'fixed top-[10px] bottom-[10px]',
            'w-[320px] bg-background border rounded-lg shadow-2xl',
            'flex flex-col z-50',
            'animate-in slide-in-from-left-4 duration-300',
          )}
          style={{
            left: `calc(var(--sidebar-width) + 10px)`,
            clipPath: isOpen
              ? 'inset(0% 0% 0% 0% round 0.5rem)'
              : 'inset(10% 45% 85% 45% round 0.5rem)',
          }}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b">
            <h3 className="text-lg font-semibold">Filtres de recherche</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Affinez votre recherche avec des critères avancés
            </p>
          </div>

          {/* Filters Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              {/* Type de propriété */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Type de propriété
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={
                        propertyTypes.includes(type) ? 'default' : 'outline'
                      }
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => togglePropertyType(type)}
                    >
                      {type}
                      {propertyTypes.includes(type) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Fourchette de prix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Prix</Label>
                  <span className="text-xs text-muted-foreground">
                    {localPriceRange[0].toLocaleString('fr-FR')} € -{' '}
                    {localPriceRange[1].toLocaleString('fr-FR')} €
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000000}
                  step={10000}
                  value={localPriceRange}
                  onValueChange={(value) =>
                    setLocalPriceRange(value as [number, number])
                  }
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min-price" className="text-xs">
                      Prix min
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={localPriceRange[0]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          parseInt(e.target.value) || 0,
                          localPriceRange[1],
                        ])
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-price" className="text-xs">
                      Prix max
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={localPriceRange[1]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          localPriceRange[0],
                          parseInt(e.target.value) || 1000000,
                        ])
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Chambres */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Chambres</Label>
                <div className="flex flex-wrap gap-2">
                  {[null, 1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value ?? 'any'}
                      variant={bedrooms === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBedrooms(value)}
                      className="flex-1 min-w-[60px]"
                    >
                      {value === null ? 'Tous' : value === 5 ? '5+' : value}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Salles de bain */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Salles de bain</Label>
                <div className="flex flex-wrap gap-2">
                  {[null, 1, 2, 3, 4].map((value) => (
                    <Button
                      key={value ?? 'any'}
                      variant={bathrooms === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBathrooms(value)}
                      className="flex-1 min-w-[60px]"
                    >
                      {value === null ? 'Tous' : value === 4 ? '4+' : value}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Surface */}
              <div className="space-y-3">
                <Label htmlFor="min-area" className="text-sm font-semibold">
                  Surface minimale (m²)
                </Label>
                <Input
                  id="min-area"
                  type="number"
                  placeholder="Ex: 50"
                  className="h-9"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 pt-4 border-t flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
