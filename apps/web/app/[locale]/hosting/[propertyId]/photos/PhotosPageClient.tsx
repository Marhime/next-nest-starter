'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEditToken } from '@/hooks/use-edit-token';
import { PhotoUploadZone } from '@/components/photos/PhotoUploadZone';
import { getPhotoUrl } from '@/lib/utils';
import { usePropertyForm } from '@/hooks/use-property-form';
import { STEP_PHOTOS, useStepValidation } from '@/hooks/use-step-validation';

interface Photo {
  id: number;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface Property {
  id: number;
  photos?: Photo[];
}

interface PhotosPageClientProps {
  property: Property;
}

export function PhotosPageClient({ property }: PhotosPageClientProps) {
  const t = useTranslations('PhotoUpload');
  const router = useRouter();
  const { propertyId } = useParams();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const MINIMUM_PHOTOS = 2;

  const { token: editToken } = useEditToken(String(propertyId));

  const [photos, setPhotos] = useState<Photo[]>(property.photos || []);
  const [loading, setLoading] = useState(false);

  // Validate step access
  useStepValidation(STEP_PHOTOS, property, false);

  // Validation
  const isValid = photos.length >= MINIMUM_PHOTOS;

  // ✅ Memoize payload
  const payload = useMemo(() => ({}), []);

  // ✅ Memoize validation callback
  const handleValidation = useCallback(async () => {
    return photos.length >= MINIMUM_PHOTOS;
  }, [photos.length, MINIMUM_PHOTOS]);

  // ✅ Memoize success callback - accepts updatedProperty to avoid stale data
  const propertyIdStable = property.id;
  const handleSuccess = useCallback(
    (_updatedProperty?: unknown) => {
      router.push(`/hosting/${propertyIdStable}/about`);
    },
    [router, propertyIdStable],
  );

  // Property form integration - photos don't need payload, just validation
  usePropertyForm({
    propertyId: property.id,
    stepIndex: 1,
    isValid,
    payload,
    onValidation: handleValidation,
    onSuccess: handleSuccess,
  });

  // Sync photos from property when it changes
  useEffect(() => {
    if (property.photos) {
      setPhotos(property.photos);
    }
  }, [property.photos]);

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (editToken) {
      headers['x-edit-token'] = editToken;
    }
    return headers;
  };

  const handleUpload = async (files: File[]) => {
    setLoading(true);

    try {
      const uploadedPhotos: Photo[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(
            `${API_URL}/photos/property/${propertyId}`,
            {
              method: 'POST',
              body: formData,
              credentials: 'include',
              headers: getHeaders(),
            },
          );

          if (!response.ok) {
            console.error(`Failed to upload ${file.name}:`, response.status);
            toast.error(`Échec de l'upload de ${file.name}`);
            continue;
          }

          const uploadedPhoto = await response.json();
          uploadedPhotos.push(uploadedPhoto);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Erreur: ${file.name}`);
        }
      }

      if (uploadedPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedPhotos]);
        toast.success(`${uploadedPhotos.length} photo(s) ajoutée(s)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      const response = await fetch(`${API_URL}/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(t('deleteError'));
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success(t('deleteSuccess'));
    } catch (err) {
      console.error('Delete photo failed', err);
      toast.error(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      const response = await fetch(`${API_URL}/photos/${photoId}/primary`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(t('updateError'));
      }

      setPhotos((prev) =>
        prev.map((p) => ({
          ...p,
          isPrimary: p.id === photoId,
        })),
      );
      toast.success(t('primarySuccess'));
    } catch (err) {
      console.error('Set primary failed', err);
      toast.error(err instanceof Error ? err.message : t('updateError'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      {/* Status Card */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('progress')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {photos.length >= MINIMUM_PHOTOS
                ? t('ready')
                : `${MINIMUM_PHOTOS - photos.length} ${t('remaining')}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{photos.length}/20</div>
            <div
              className={`text-sm ${
                photos.length >= MINIMUM_PHOTOS
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}
            >
              {photos.length >= MINIMUM_PHOTOS
                ? `✓ ${t('remaining')}`
                : 'Minimum 2'}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('uploadTitle')}</h3>
        <PhotoUploadZone
          onUpload={handleUpload}
          maxFiles={20 - photos.length}
          disabled={loading || photos.length >= 20}
        />
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">
            {t('yourPhotos')} ({photos.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('coverPhotoInfo')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
            {photos
              .sort((a, b) => {
                if (a.isPrimary && !b.isPrimary) return -1;
                if (!a.isPrimary && b.isPrimary) return 1;
                return a.order - b.order;
              })
              .map((photo, index) => {
                const isCover = index === 0;

                return (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden border-2 hover:border-primary transition-colors ${
                      isCover ? 'md:col-span-2 md:row-span-2' : 'aspect-square'
                    }`}
                  >
                    <div
                      className={
                        isCover ? 'h-full min-h-[400px]' : 'aspect-square'
                      }
                    >
                      <Image
                        src={getPhotoUrl(photo.url)}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes={
                          isCover
                            ? '(max-width: 768px) 100vw, 50vw'
                            : '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
                        }
                        priority={isCover}
                        unoptimized
                      />
                    </div>

                    {isCover && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded font-semibold shadow-lg">
                        {t('coverBadge')}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap p-4">
                      {!isCover && (
                        <button
                          onClick={() => handleSetPrimary(photo.id)}
                          className="px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100 font-medium shadow-lg"
                        >
                          {t('setCoverButton')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 font-medium shadow-lg"
                      >
                        {t('deleteButton')}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotosPageClient;
