/**
 * Property Card Component
 * Displays property information in a card format with hover effects
 */

'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { cn, formattedMXNPrice, getPhotoUrl } from '@/lib/utils';
import {
  getListingTypeLabel,
  getPropertyTypeLabel,
  getPriceLabel,
} from '@/lib/property-labels';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { useIsFavorited, useToggleFavorite } from '@/hooks/use-favorites';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = React.memo(function PropertyCard({
  property,
}: PropertyCardProps) {
  const { hoverProperty } = useSearchStore();
  const { isFavorited, isLoading: isCheckingFavorite } = useIsFavorited(
    property.id,
  );
  const { toggleFavorite } = useToggleFavorite();
  const { requireAuth } = useProtectedAction();
  const [localFavoriteState, setLocalFavoriteState] = useState(false);
  const t = useTranslations('SearchFilters');

  // Sync local state with server state
  useEffect(() => {
    if (!isCheckingFavorite) {
      setLocalFavoriteState(isFavorited);
    }
  }, [isFavorited, isCheckingFavorite]);

  const primaryPhoto =
    property.photos.find((p) => p.isPrimary) || property.photos[0];

  const priceLabel = getPriceLabel(property.listingType || '', t('perMonth'));

  const handleFavoriteClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Use requireAuth to wrap the favorite action
      await requireAuth(
        async () => {
          // Optimistic UI update
          setLocalFavoriteState((prev) => !prev);

          // Call API
          try {
            const newStatus = await toggleFavorite(
              property.id,
              localFavoriteState,
            );
            setLocalFavoriteState(newStatus);
          } catch {
            // Rollback on error
            setLocalFavoriteState(localFavoriteState);
          }
        },
        localFavoriteState ? 'unfavorite' : 'favorite',
        { propertyId: property.id },
        'login', // Prefer login for quick action
      );
    },
    [property.id, localFavoriteState, requireAuth, toggleFavorite],
  );

  return (
    <Link target="_blank" href={`/property/${property.id}`}>
      <div
        className={cn(
          'cursor-pointer overflow-hidden w-full max-w-[480px] mx-auto p-0',
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
                className="object-cover transition-transform duration-300 in-[a:hover]:scale-[1.02] h-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <Image
                  src={'/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-300 in-[a:hover]:scale-110 h-full"
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
            <button
              className={cn(
                'group absolute top-3 right-3 transition-all z-10 text-white hover:scale-110 ',
                localFavoriteState && 'text-red-500 scale-110',
              )}
              onClick={handleFavoriteClick}
              disabled={isCheckingFavorite}
            >
              <Heart
                className={cn(
                  'w-6 h-6 group-hover:fill-current',
                  localFavoriteState && 'fill-current',
                )}
              />
            </button>
          </div>

          {/* Content Section */}
          <div className="pt-4 grid grid-rows-4 gap-1">
            {/* Title */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-md line-clamp-1">
                {property.title}
              </h3>
              {/* Property Details */}
              {property.bedrooms || property.bathrooms || property.area ? (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}

                  {property.bathrooms && property.bathrooms > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}

                  {property.area && property.area > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Square className="w-4 h-4" />
                      <span>{property.area}m²</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">
                {property.address || property.city}
                {property.city && property.state && `, ${property.state}`}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-md font-semibold">
                {formattedMXNPrice(Number(property.price))}
                {property.currency}
              </span>
              {priceLabel && (
                <span className="text-xs text-muted-foreground">
                  {priceLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
