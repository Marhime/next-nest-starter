/**
 * Property Card Floating
 * Compact card for map overlay with slide-in animation
 */

'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, MapPin, Bed, Bath, Square } from 'lucide-react';
import { type Property } from '@/stores/search-store';
import { cn, getPhotoUrl } from '@/lib/utils';

interface PropertyCardFloatingProps {
  property: Property;
  onClose: () => void;
  className?: string;
}

export function PropertyCardFloating({
  property,
  onClose,
  className,
}: PropertyCardFloatingProps) {
  const primaryPhoto =
    property.photos.find((p) => p.isPrimary) || property.photos[0];
  const price =
    property.salePrice || property.monthlyPrice || property.nightlyPrice;
  const priceLabel = property.salePrice
    ? ''
    : property.monthlyPrice
      ? '/mois'
      : property.nightlyPrice
        ? '/nuit'
        : '';

  const handleViewDetails = () => {
    window.open(`/property/${property.id}`, '_blank');
  };

  return (
    <Card
      className={cn(
        'absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000] shadow-2xl border-0',
        'animate-in slide-in-from-bottom-4 duration-300',
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="flex gap-3 p-3">
          {/* Image */}
          {primaryPhoto && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getPhotoUrl(primaryPhoto.url)}
                alt={property.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                {/* Property Type Badge */}
                {property.propertyType && (
                  <Badge variant="secondary" className="text-xs mb-1">
                    {property.propertyType}
                  </Badge>
                )}
                {/* Title */}
                <h3 className="font-semibold text-sm line-clamp-1">
                  {property.title}
                </h3>
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Location */}
            {property.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">
                  {property.city}
                  {property.state && `, ${property.state}`}
                </span>
              </div>
            )}

            {/* Details */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              {property.bedrooms !== undefined && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms !== undefined && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {property.bathrooms}
                </span>
              )}
              {property.area && (
                <span className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  {property.area}m²
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between gap-2">
              {price && (
                <div className="text-sm font-bold text-primary">
                  {price}
                  {property.currency === 'EUR'
                    ? ' €'
                    : ` ${property.currency || '€'}`}
                  {priceLabel && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {priceLabel}
                    </span>
                  )}
                </div>
              )}

              <Button
                size="sm"
                onClick={handleViewDetails}
                className="h-7 text-xs"
              >
                Voir
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
