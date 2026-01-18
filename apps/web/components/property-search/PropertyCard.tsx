/**
 * Property Card Component
 * Displays property information in a card format with hover effects
 */

'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { cn, getPhotoUrl } from '@/lib/utils';
import {
  getListingTypeLabel,
  getPropertyTypeLabel,
  getPriceLabel,
} from '@/lib/property-labels';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Property } from '@/hooks/use-properties';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = React.memo(function PropertyCard({
  property,
}: PropertyCardProps) {
  const { hoverProperty } = useSearchStore();
  const [isFavorite, setIsFavorite] = useState(false);
  console.log('wejnfkjwen');

  const primaryPhoto =
    property.photos.find((p) => p.isPrimary) || property.photos[0];

  const priceLabel = getPriceLabel(property.listingType || '');

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  }, []);

  return (
    <Link target="_blank" href={`/property/${property.id}`}>
      <div
        className={cn(
          'group cursor-pointer overflow-hidden w-full max-w-[480px] mx-auto p-0',
        )}
        onMouseEnter={() => hoverProperty(property.id)}
        onMouseLeave={() => hoverProperty(null)}
      >
        <div className="p-0">
          {/* Image Section */}
          <div className="relative w-full h-72 overflow-hidden bg-muted rounded-2xl">
            {primaryPhoto ? (
              <Image
                src={getPhotoUrl(primaryPhoto.url)}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02] h-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <Image
                  src={'/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110 h-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {property.listingType && (
                <Badge
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm"
                >
                  {getListingTypeLabel(property.listingType)}
                </Badge>
              )}
              {property.propertyType && (
                <Badge
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm"
                >
                  {getPropertyTypeLabel(property.propertyType)}
                </Badge>
              )}
            </div>

            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-3 right-3 bg-background/90 backdrop-blur-sm hover:bg-background transition-all',
                isFavorite && 'text-red-500',
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
            </Button>
          </div>

          {/* Content Section */}
          <div className="pt-4 grid grid-rows-4 gap-1">
            {/* Price */}

            <div className="flex items-baseline gap-1">
              <span className="text-md font-bold">
                {property.price}
                {property.currency}
              </span>
              {priceLabel && (
                <span className="text-xs text-muted-foreground">
                  {priceLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-md line-clamp-1">
              {property.title}
            </h3>

            {/* Location */}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">
                {property.address || property.city}
                {property.city && property.state && `, ${property.state}`}
              </span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
