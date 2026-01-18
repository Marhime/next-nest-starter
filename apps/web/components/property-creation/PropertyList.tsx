'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Property, useUserProperties } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
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
import { getPhotoUrl } from '@/lib/utils';

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
  const t = useTranslations('PropertyList');
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

      const publishPromise = fetch(
        `${API_URL}/properties/${property.id}/publish`,
        {
          method: 'POST',
          credentials: 'include',
        },
      ).then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to publish');
        }
        return response.json();
      });

      await toast.promise(publishPromise, {
        loading: t('publishing') || 'Publication...',
        success: t('publishSuccess'),
        error: (err) => err.message || 'Erreur lors de la publication',
      });

      // Recharger la liste des propriétés
      window.location.reload();
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const unpublishPromise = fetch(
      `${API_URL}/properties/${property.id}/unpublish`,
      {
        method: 'POST',
        credentials: 'include',
      },
    ).then(async (response) => {
      if (!response.ok) throw new Error('Failed to unpublish');
      return response.json();
    });

    await toast.promise(unpublishPromise, {
      loading: 'Mise en brouillon...',
      success: t('draftSuccess'),
      error: t('updateError'),
    });

    window.location.reload();
  };

  const getPrice = () => {
    console.log(property);
    if (property.price) {
      return `${property.currency || 'MXN'} $${property.price}`;
    }
    return t('priceNotSet');
  };

  const getPropertyTypeLabel = (type: string) => {
    return t(`propertyTypes.${type}` as 'propertyTypes.HOUSE') || type;
  };

  return (
    <Card className="overflow-hidden pt-0 hover:shadow-lg transition-shadow">
      <div className="relative aspect-video w-full bg-muted">
        {primaryPhoto ? (
          <Image
            src={getPhotoUrl(primaryPhoto.url)}
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
              {t('draft')}
            </Badge>
          )}
          {!isDraft && property.status === 'ACTIVE' && (
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              {t('published')}
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
                {t('modify')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(property.id)}>
                <Copy className="h-4 w-4 mr-2" />
                {t('duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                {t('preview')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isDraft && validationResult?.isValid && (
                <DropdownMenuItem
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPublishing ? t('publishing') : t('publish')}
                </DropdownMenuItem>
              )}
              {!isDraft && property.status === 'ACTIVE' && (
                <DropdownMenuItem onClick={handleUnpublish}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t('setToDraft')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(property.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
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
              <span>
                {property.bedrooms} {t('bedrooms')}
              </span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>
                {property.bathrooms} {t('bathrooms')}
              </span>
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
              {t('modify')}
            </Button>
            {validationResult?.isValid ? (
              <Button
                className="flex-1"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? t('publishing') : t('publish')}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => onEdit(property.id)}
                variant="default"
              >
                {t('complete')}
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
            {t('editListing')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function PropertyCardSkeleton() {
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
  const t = useTranslations('PropertyList');

  const handleEdit = (id: number) => {
    router.push(`/hosting/${id}`);
  };

  const handleDuplicate = async (id: number) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const duplicatePromise = async () => {
      const response = await fetch(`${API_URL}/properties/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to duplicate');
      return response.json();
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newProperty: any = await toast.promise(duplicatePromise(), {
        loading: t('duplicating') || 'Duplication...',
        success: t('duplicateSuccess'),
        error: (err) => err?.message || t('duplicateError'),
      });

      mutate(); // Rafraîchir la liste
      router.push(`/hosting/${newProperty.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('deleteConfirmMessage'))) {
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const deletePromise = fetch(`${API_URL}/properties/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to delete');
      return response;
    });

    try {
      await toast.promise(deletePromise, {
        loading: t('deleting') || 'Suppression...',
        success: t('deleteSuccess'),
        error: t('deleteError') || 'Erreur lors de la suppression',
      });

      mutate(); // Rafraîchir la liste
    } catch (error) {
      // Error already handled by toast.promise
      console.error(error);
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
            {t('drafts')} ({drafts.length})
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
            {t('activeListings')} ({active.length})
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
