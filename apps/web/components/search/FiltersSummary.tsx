/**
 * Filters Summary
 * Display active filters as removable badges
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';

export function FiltersSummary() {
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
    amenities,
    setListingType,
    setLocation,
    setPriceRange,
    setPropertyType,
    setBedroomsRange,
    setBathroomsMin,
    setAreaRange,
    toggleAmenity,
    resetFilters,
  } = useSearchStore();

  const activeFilters = [];

  if (listingType) {
    activeFilters.push({
      label:
        listingType === 'SALE'
          ? 'Acheter'
          : listingType === 'RENT'
            ? 'Louer'
            : 'Vacances',
      onRemove: () => setListingType(null),
    });
  }

  if (location) {
    activeFilters.push({
      label: location,
      onRemove: () => setLocation(null),
    });
  }

  if (minPrice || maxPrice) {
    const label =
      minPrice && maxPrice
        ? `${minPrice}€ - ${maxPrice}€`
        : minPrice
          ? `> ${minPrice}€`
          : `< ${maxPrice}€`;
    activeFilters.push({
      label,
      onRemove: () => setPriceRange(null, null),
    });
  }

  if (propertyType) {
    const labels: Record<string, string> = {
      APARTMENT: 'Appartement',
      HOUSE: 'Maison',
      VILLA: 'Villa',
      STUDIO: 'Studio',
    };
    activeFilters.push({
      label: labels[propertyType] || propertyType,
      onRemove: () => setPropertyType(null),
    });
  }

  if (minBedrooms) {
    activeFilters.push({
      label: `${minBedrooms}+ chambres`,
      onRemove: () => setBedroomsRange(null, null),
    });
  }

  if (minBathrooms) {
    activeFilters.push({
      label: `${minBathrooms}+ salles de bain`,
      onRemove: () => setBathroomsMin(null),
    });
  }

  if (minArea || maxArea) {
    const label =
      minArea && maxArea
        ? `${minArea}-${maxArea}m²`
        : minArea
          ? `> ${minArea}m²`
          : `< ${maxArea}m²`;
    activeFilters.push({
      label,
      onRemove: () => setAreaRange(null, null),
    });
  }

  amenities.forEach((amenity) => {
    const labels: Record<string, string> = {
      parking: 'Parking',
      garage: 'Garage',
      garden: 'Jardin',
      pool: 'Piscine',
      terrace: 'Terrasse',
      balcony: 'Balcon',
      elevator: 'Ascenseur',
      wifi: 'WiFi',
      air_conditioning: 'Climatisation',
      heating: 'Chauffage',
    };
    activeFilters.push({
      label: labels[amenity] || amenity,
      onRemove: () => toggleAmenity(amenity),
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 border-b">
      <span className="text-sm text-muted-foreground font-medium">
        Filtres actifs:
      </span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="gap-1.5 pr-1 cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-muted"
            onClick={filter.onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={resetFilters}
      >
        Tout effacer
      </Button>
    </div>
  );
}
