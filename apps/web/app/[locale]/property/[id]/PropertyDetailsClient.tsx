/**
 * Property Details Client Component
 * Modern interactive PDP with gallery, map, favorites
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Share2,
  Heart,
  ChevronLeft,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { PropertyGallery } from '@/components/property-details/PropertyGallery';

// Dynamic import for map (SSR disabled)
const MapView = dynamic(
  () => import('@/components/location/MapView').then((mod) => mod.MapView),
  { ssr: false },
);

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Property {
  id: number;
  title: string;
  description?: string;
  propertyType: string;
  listingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  floor?: number;
  area?: number;
  amenities?: string[];
  status: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  monthlyPrice?: string;
  nightlyPrice?: string;
  salePrice?: string;
  currency?: string;
  photos: Photo[];
  user?: User;
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  air_conditioning: 'Climatisation',
  heating: 'Chauffage',
  kitchen: 'Cuisine équipée',
  tv: 'Télévision',
  refrigerator: 'Réfrigérateur',
  washing_machine: 'Machine à laver',
  parking: 'Parking',
  garage: 'Garage',
  garden: 'Jardin',
  balcony: 'Balcon',
  terrace: 'Terrasse',
  pool: 'Piscine',
  gym: 'Salle de sport',
  jacuzzi: 'Jacuzzi',
  security: 'Sécurité 24h',
  doorman: 'Portier',
  elevator: 'Ascenseur',
  furnished: 'Meublé',
  pets_allowed: 'Animaux acceptés',
  cleaning_service: 'Service de ménage',
  ventilator: 'Ventilateurs',
};

interface Props {
  property: Property;
}

export default function PropertyDetailsClient({ property }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  const photos = property.photos || [];

  // Calculate price display
  const price =
    property.salePrice || property.monthlyPrice || property.nightlyPrice;
  const priceLabel = property.salePrice
    ? ''
    : property.monthlyPrice
      ? '/mois'
      : '/nuit';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description || property.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  'rounded-full transition-colors',
                  isFavorite && 'text-red-500 hover:text-red-600',
                )}
              >
                <Heart
                  className={cn('h-5 w-5', isFavorite && 'fill-current')}
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Gallery - New Component */}
      <section className="container mx-auto px-4 py-6">
        <PropertyGallery photos={photos} propertyTitle={property.title} />
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Location */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {property.title}
                  </h1>
                  {property.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {property.address || property.city}
                        {property.state && `, ${property.state}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Type Badges */}
              <div className="flex flex-wrap gap-2">
                {property.propertyType && (
                  <Badge variant="secondary">{property.propertyType}</Badge>
                )}
                {property.listingType && (
                  <Badge variant="outline">{property.listingType}</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    {property.bedrooms} chambre
                    {property.bedrooms > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    {property.bathrooms} salle
                    {property.bathrooms > 1 ? 's' : ''} de bain
                  </span>
                </div>
              )}
              {property.capacity !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    {property.capacity} personne
                    {property.capacity > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">{property.area}m²</span>
                </div>
              )}
              {property.floor !== undefined && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    {property.floor === 0
                      ? 'Rez-de-chaussée'
                      : `Étage ${property.floor}`}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">À propos</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Équipements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities.map((amenityId) => (
                      <div
                        key={amenityId}
                        className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{AMENITY_LABELS[amenityId] || amenityId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <>
                <Separator />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Emplacement</h2>
                  <div className="rounded-2xl overflow-hidden border">
                    <MapView
                      latitude={property.latitude}
                      longitude={property.longitude}
                      zoom={15}
                      className="h-[400px] w-full"
                      markerTitle={property.title}
                    />
                  </div>
                  {property.address && (
                    <p className="text-sm text-muted-foreground mt-4">
                      {property.address}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6 shadow-lg border-2">
              <div className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {price}
                      {property.currency === 'EUR'
                        ? ' €'
                        : ` ${property.currency || '€'}`}
                    </span>
                    {priceLabel && (
                      <span className="text-muted-foreground">
                        {priceLabel}
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Host Info */}
                {property.user && (
                  <div>
                    <h3 className="font-semibold mb-3">Hébergé par</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {property.user.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {property.user.firstName} {property.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">Hôte</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button className="w-full" size="lg">
                  Contacter l&apos;hôte
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Réservez en toute confiance
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
