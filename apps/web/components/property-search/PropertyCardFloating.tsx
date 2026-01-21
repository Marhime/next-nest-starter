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
import { getPriceLabel } from '@/lib/property-labels';
import { useTranslations } from 'next-intl';

interface PropertyCardFloatingProps {
  property: Property;
  onClose: () => void;
  className?: string;
  variant?: 'compact' | 'landscape';
}

export function PropertyCardFloating({
  property,
  onClose,
  className,
  variant = 'compact',
}: PropertyCardFloatingProps) {
  const primaryPhoto =
    property.photos.find((p) => p.isPrimary) || property.photos[0];
  const price = property.price;
  const t = useTranslations('SearchFilters');

  const priceLabel = getPriceLabel(property.listingType || '', t('perMonth'));

  const handleViewDetails = () => {
    window.open(`/property/${property.id}`, '_blank');
  };

  const isLandscape = variant === 'landscape';

  return (
    <Card
      className={cn(
        'shadow-xl border',
        isLandscape
          ? 'w-full max-w-2xl'
          : 'absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000] shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300',
        className,
      )}
    >
      <CardContent className="p-0">
        <div className={cn('flex gap-4', isLandscape ? 'p-4' : 'p-3')}>
          {/* Image */}
          {primaryPhoto && (
            <div
              className={cn(
                'relative rounded-lg overflow-hidden flex-shrink-0',
                isLandscape ? 'w-48 h-36' : 'w-28 h-28',
              )}
            >
              <Image
                src={getPhotoUrl(primaryPhoto.url)}
                alt={property.title}
                fill
                className="object-cover"
                sizes={isLandscape ? '192px' : '112px'}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                {/* Property Type Badge */}
                {property.propertyType && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'mb-1.5',
                      isLandscape ? 'text-xs' : 'text-xs',
                    )}
                  >
                    {property.propertyType}
                  </Badge>
                )}
                {/* Title */}
                <h3
                  className={cn(
                    'font-semibold line-clamp-1',
                    isLandscape ? 'text-base' : 'text-sm',
                  )}
                >
                  {property.title}
                </h3>
              </div>

              {/* Close button */}
              {!isLandscape && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Location */}
            {property.city && (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-muted-foreground mb-3',
                  isLandscape ? 'text-sm' : 'text-xs',
                )}
              >
                <MapPin className={cn(isLandscape ? 'h-4 w-4' : 'h-3 w-3')} />
                <span className="line-clamp-1">
                  {property.city}
                  {property.state && `, ${property.state}`}
                </span>
              </div>
            )}

            {/* Details */}
            <div
              className={cn(
                'flex items-center gap-4 text-muted-foreground mb-auto',
                isLandscape ? 'text-sm' : 'text-xs',
              )}
            >
              {property.bedrooms !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Bed className={cn(isLandscape ? 'h-4 w-4' : 'h-3 w-3')} />
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Bath className={cn(isLandscape ? 'h-4 w-4' : 'h-3 w-3')} />
                  {property.bathrooms}
                </span>
              )}
              {property.area && (
                <span className="flex items-center gap-1.5">
                  <Square className={cn(isLandscape ? 'h-4 w-4' : 'h-3 w-3')} />
                  {property.area}m²
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t">
              {price && (
                <div
                  className={cn(
                    'font-bold text-primary',
                    isLandscape ? 'text-lg' : 'text-sm',
                  )}
                >
                  {price}
                  {property.currency === 'EUR'
                    ? ' €'
                    : ` ${property.currency || '€'}`}
                  {priceLabel && (
                    <span
                      className={cn(
                        'font-normal text-muted-foreground ml-1',
                        isLandscape ? 'text-sm' : 'text-xs',
                      )}
                    >
                      {priceLabel}
                    </span>
                  )}
                </div>
              )}

              <Button
                size={isLandscape ? 'default' : 'sm'}
                onClick={handleViewDetails}
                className={cn(isLandscape ? 'h-9' : 'h-7 text-xs')}
              >
                Voir
                <ExternalLink
                  className={cn('ml-1.5', isLandscape ? 'h-4 w-4' : 'h-3 w-3')}
                />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
