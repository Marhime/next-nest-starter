'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEditToken } from '@/hooks/use-edit-token';
import { PhotoUploadZone } from '@/components/photos/PhotoUploadZone';
import { cn, getPhotoUrl } from '@/lib/utils';
import { usePropertyForm } from '@/hooks/use-property-form';
import { STEP_PHOTOS, useStepValidation } from '@/hooks/use-step-validation';
import { Card, CardTitle } from '@/components/ui/card';
import { Camera, Star, Trash2, Check } from 'lucide-react';

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
  const handleSuccess = useCallback(() => {
    router.push(`/hosting/${propertyIdStable}/about`);
  }, [router, propertyIdStable]);

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
    } catch (err) {
      console.error('Set primary failed', err);
      toast.error(err instanceof Error ? err.message : t('updateError'));
    }
  };

  console.log(MINIMUM_PHOTOS - photos.length, photos.length, MINIMUM_PHOTOS);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      {/* Upload Zone - Shown after gallery or first if no photos */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {photos.length > 0
                  ? t('upload.addMoreTitle')
                  : t('upload.title')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('upload.description')}
              </p>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  'text-3xl font-bold',
                  photos.length >= MINIMUM_PHOTOS && ' text-primary',
                )}
              >
                {photos.length >= MINIMUM_PHOTOS
                  ? `${photos.length}`
                  : `${photos.length}/${2}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('status.maxPhotos')}
              </div>
            </div>
          </div>
          <PhotoUploadZone
            onUpload={handleUpload}
            maxFiles={20 - photos.length}
            disabled={loading || photos.length >= 20}
          />
        </div>
      </Card>

      {/* Gallery - Shown FIRST if photos exist */}
      {photos.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {t('gallery.title')} (
                {photos.length >= MINIMUM_PHOTOS
                  ? `${photos.length}`
                  : `${photos.length}/${2}`}
                )
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('gallery.description')}
              </p>
            </div>

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
                      className={`relative group rounded-lg overflow-hidden border-2 hover:border-primary transition-all duration-300 ${
                        isCover
                          ? 'md:col-span-2 md:row-span-2 border-primary/50'
                          : 'aspect-square hover:shadow-lg'
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
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1.5">
                          <Star className="h-3 w-3 fill-current" />
                          {t('gallery.coverBadge')}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <div className="flex flex-col gap-2 w-full">
                          {!isCover && (
                            <button
                              onClick={() => handleSetPrimary(photo.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-100 font-medium shadow-lg transition-colors"
                              title={t('gallery.setCoverButton')}
                            >
                              <Star className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                {t('gallery.setCoverButton')}
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(photo.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 font-medium shadow-lg transition-colors"
                            title={t('gallery.deleteButton')}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t('gallery.deleteButton')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PhotosPageClient;
