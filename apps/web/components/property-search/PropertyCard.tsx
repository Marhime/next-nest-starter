/**
 * Property Card Component
 * Displays property information in a card format with hover effects
 */

'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useSearchStore, type Property } from '@/stores/search-store';
import { cn, getPhotoUrl } from '@/lib/utils';
import {
  getListingTypeLabel,
  getPropertyTypeLabel,
  getPriceLabel,
} from '@/lib/property-labels';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = React.memo(function PropertyCard({
  property,
}: PropertyCardProps) {
  const { hoverProperty } = useSearchStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const primaryPhoto =
    property.photos.find((p) => p.isPrimary) || property.photos[0];

  const priceLabel = getPriceLabel(property.listingType);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  }, []);

  return (
    <Link target="_blank" href={`/property/${property.id}`}>
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl w-full max-w-[480px] mx-auto p-0',
        )}
        onMouseEnter={() => hoverProperty(property.id)}
        onMouseLeave={() => hoverProperty(null)}
      >
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative w-full h-64 overflow-hidden bg-muted">
            {primaryPhoto ? (
              <Image
                src={getPhotoUrl(primaryPhoto.url)}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110 h-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <MapPin className="w-12 h-12 text-muted-foreground" />
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
          <div className="p-4 space-y-3">
            {/* Price */}
            {property.price && (
              <div className="flex items-baseline gap-1">
                <span className="text-md font-bold text-primary">
                  {property.price}
                  {property.currency === 'EUR'
                    ? ' €'
                    : ` ${property.currency || '€'}`}
                </span>
                {priceLabel && (
                  <span className="text-xs text-muted-foreground">
                    {priceLabel}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-md line-clamp-1">
              {property.title}
            </h3>

            {/* Location */}
            {(property.city || property.address) && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-1">
                  {property.address || property.city}
                  {property.city && property.state && `, ${property.state}`}
                </span>
              </div>
            )}

            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1.5">
                  <Square className="w-4 h-4" />
                  <span>{property.area}m²</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
