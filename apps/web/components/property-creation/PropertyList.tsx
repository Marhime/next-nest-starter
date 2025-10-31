'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserProperties } from '@/hooks/use-properties';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  MapPin,
  Bed,
  Bath,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface Property {
  id: number;
  propertyType: string;
  listingType?: string;
  title: string;
  description?: string;
  status: string;
  monthlyPrice?: string;
  nightlyPrice?: string;
  salePrice?: string;
  currency?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  photos: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onEdit: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

function PropertyCard({
  property,
  onEdit,
  onDuplicate,
  onDelete,
}: PropertyCardProps) {
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<{
    isValid: boolean;
    missingFields: string[];
  } | null>(null);

  const primaryPhoto =
    property.photos?.find((p) => p.isPrimary) || property.photos?.[0];
  const isDraft = property.status === 'DRAFT';

  const checkIfCanPublish = React.useCallback(async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_URL}/properties/${property.id}/validate`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
      }
    } catch (error) {
      console.error('Error checking publication status:', error);
    }
  }, [property.id]);

  React.useEffect(() => {
    // Vérifier si la propriété peut être publiée
    if (isDraft) {
      checkIfCanPublish();
    }
  }, [isDraft, checkIfCanPublish]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_URL}/properties/${property.id}/publish`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish');
      }

      toast.success('Annonce publiée avec succès !');
      // Recharger la liste des propriétés
      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la publication';
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_URL}/properties/${property.id}/unpublish`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) throw new Error('Failed to unpublish');

      toast.success('Annonce remise en brouillon');
      window.location.reload();
    } catch {
      toast.error('Erreur lors de la modification');
    }
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

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOUSE: 'Maison',
      APARTMENT: 'Appartement',
      LAND: 'Terrain',
      HOTEL: 'Hôtel',
      HOSTEL: 'Auberge',
      GUESTHOUSE: "Maison d'hôtes",
      ROOM: 'Chambre',
    };
    return labels[type] || type;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video w-full bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {isDraft && (
            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
              Brouillon
            </Badge>
          )}
          {!isDraft && property.status === 'ACTIVE' && (
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              Actif
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{property.title}</CardTitle>
            <CardDescription className="mt-1">
              <span className="font-medium">
                {getPropertyTypeLabel(property.propertyType)}
              </span>
              {property.city && (
                <span className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {property.city}
                  {property.state && `, ${property.state}`}
                </span>
              )}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(property.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(property.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isDraft && validationResult?.isValid && (
                <DropdownMenuItem
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publication...' : 'Publier'}
                </DropdownMenuItem>
              )}
              {!isDraft && property.status === 'ACTIVE' && (
                <DropdownMenuItem onClick={handleUnpublish}>
                  <Eye className="h-4 w-4 mr-2" />
                  Remettre en brouillon
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(property.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} ch.</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} sdb.</span>
            </div>
          )}
        </div>
        <div className="mt-2 font-semibold">{getPrice()}</div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {isDraft && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(property.id)}
            >
              Modifier
            </Button>
            {validationResult?.isValid ? (
              <Button
                className="flex-1"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publication...' : 'Publier'}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => onEdit(property.id)}
                variant="default"
              >
                Compléter
              </Button>
            )}
          </>
        )}
        {!isDraft && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onEdit(property.id)}
          >
            Modifier l&apos;annonce
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export function PropertyList() {
  const { properties, isLoading, mutate } = useUserProperties();
  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/hosting/${id}`);
  };

  const handleDuplicate = async (id: number) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/properties/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to duplicate');

      const newProperty = await response.json();
      toast.success('Annonce dupliquée avec succès !');
      mutate(); // Rafraîchir la liste
      router.push(`/hosting/${newProperty.id}`);
    } catch {
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Annonce supprimée avec succès !');
      mutate(); // Rafraîchir la liste
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return null;
  }

  // Séparer les brouillons des annonces actives
  const drafts = properties.filter((p) => p.status === 'DRAFT');
  const active = properties.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      {drafts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Brouillons ({drafts.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Annonces actives ({active.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {active.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
