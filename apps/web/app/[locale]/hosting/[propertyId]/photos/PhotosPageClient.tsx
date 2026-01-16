'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAddPropertyStore } from '../../store';
import { PhotoUploadZone } from '@/components/photos/PhotoUploadZone';
import { getPhotoUrl } from '@/lib/utils';
import type { Photo } from '@/types/photo';

interface PhotosPageClientProps {
  propertyId: number;
  initialPhotos: Photo[];
}

export function PhotosPageClient({
  propertyId,
  initialPhotos,
}: PhotosPageClientProps) {
  const t = useTranslations('PhotoUpload');
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const MINIMUM_PHOTOS = 2;

  const tokenKey = `property-edit-token:${propertyId}`;
  const editToken =
    (typeof window !== 'undefined' && localStorage.getItem(tokenKey)) ||
    undefined;
  const headers: Record<string, string> = {};

  if (editToken) {
    headers['x-edit-token'] = editToken;
  }

  useEffect(() => {
    // Photos step is index 1 in the new flow (0=location,1=photos,2=characteristics...)
    setCurrentStep?.(1);
  }, [setCurrentStep]);

  // Validation: minimum 5 photos
  useEffect(() => {
    const isValid = photos.length >= MINIMUM_PHOTOS;
    setCanProceed?.(isValid);

    // Mark step as complete when we have at least 5 photos (step 1)
    if (isValid) {
      setPropertyProgress?.(propertyId, 1, true);
    }
  }, [photos.length, setCanProceed, propertyId, setPropertyProgress]);

  // Upload photos
  const handleUpload = async (files: File[]) => {
    setLoading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('hi');

        const response = await fetch(
          `${API_URL}/photos/property/${propertyId}`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers,
          },
        );

        console.log('ho');

        if (!response.ok) {
          throw new Error(`Échec de l'upload de ${file.name}`);
        }

        const uploadedPhoto = await response.json();
        console.log('Photo uploadée:', uploadedPhoto);
        return uploadedPhoto;
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploadedPhotos]);
    } finally {
      setLoading(false);
    }
  };

  // Delete photo
  const handleDelete = async (photoId: number) => {
    try {
      const response = await fetch(`${API_URL}/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(t('deleteError'));
      }

      // Update UI silently on success
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error('Delete photo failed', err);
      toast.error(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  // Set primary photo
  const handleSetPrimary = async (photoId: number) => {
    try {
      const response = await fetch(`${API_URL}/photos/${photoId}/primary`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(t('updateError'));
      }

      // Update UI silently on success
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Status */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{photos.length}/20</div>
            <div className="text-sm text-muted-foreground">
              {photos.length >= MINIMUM_PHOTOS
                ? t('ready')
                : `${MINIMUM_PHOTOS - photos.length} ${t('remaining')}`}
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
          <h3 className="text-lg font-semibold mb-4">
            {t('yourPhotos')} ({photos.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('coverPhotoInfo')}
          </p>

          {/* Grid Layout - Airbnb Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
            {photos
              .sort((a, b) => {
                // Primary photo first
                if (a.isPrimary && !b.isPrimary) return -1;
                if (!a.isPrimary && b.isPrimary) return 1;
                // Then by order
                return a.order - b.order;
              })
              .map((photo, index) => {
                const isCover = index === 0; // First photo is always cover

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

                    {/* Cover badge */}
                    {isCover && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded font-semibold shadow-lg">
                        {t('coverBadge')}
                      </div>
                    )}

                    {/* Actions overlay */}
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
