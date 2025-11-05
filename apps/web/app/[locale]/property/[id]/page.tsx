import { cookies } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bed,
  Bath,
  Users,
  Building2,
  Maximize2,
  MapPin,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

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
  monthlyPrice?: string;
  nightlyPrice?: string;
  salePrice?: string;
  currency?: string;
  photos: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
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

async function getProperty(propertyId: string): Promise<Property> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/properties/${propertyId}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const primaryPhoto = property.photos.find((p) => p.isPrimary);
  const otherPhotos = property.photos.filter((p) => !p.isPrimary);

  const getImageUrl = (url: string) => {
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  const getPrice = () => {
    if (property.nightlyPrice) {
      return `${property.currency || 'MXN'} $${property.nightlyPrice}/nuit`;
    }
    if (property.monthlyPrice) {
      return `${property.currency || 'MXN'} $${property.monthlyPrice}/mois`;
    }
    if (property.salePrice) {
      return `${property.currency || 'MXN'} $${property.salePrice}`;
    }
    return 'Prix non défini';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/hosting">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à mes annonces
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
          {primaryPhoto && (
            <div className="col-span-2 row-span-2 relative aspect-square md:aspect-auto md:h-[500px]">
              <Image
                src={getImageUrl(primaryPhoto.url)}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          )}
          {otherPhotos.slice(0, 4).map((photo, index) => (
            <div key={photo.id} className="relative aspect-square">
              <Image
                src={getImageUrl(photo.url)}
                alt={`${property.title} - ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{property.propertyType}</Badge>
                {property.listingType && (
                  <Badge variant="secondary">{property.listingType}</Badge>
                )}
                <Badge
                  className={
                    property.status === 'ACTIVE'
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }
                >
                  {property.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              {(property.city || property.state) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <p>
                    {property.city}
                    {property.state && `, ${property.state}`}
                    {property.country && `, ${property.country}`}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 pb-6 border-b">
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
              {property.area !== undefined && property.area > 0 && (
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">{property.area} m²</span>
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

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenityId) => (
                    <div
                      key={amenityId}
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{AMENITY_LABELS[amenityId] || amenityId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Price Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-3xl font-bold">{getPrice()}</p>
              </div>

              <Button className="w-full" size="lg">
                Contacter
              </Button>

              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>ID de l&apos;annonce:</strong> #{property.id}
                </p>
                {property.address && (
                  <p>
                    <strong>Adresse:</strong> {property.address}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
