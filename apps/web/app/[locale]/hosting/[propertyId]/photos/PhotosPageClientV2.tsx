/**
 * PhotosPageClient Component
 * Modern photo management page with optimized upload,
 * drag-and-drop reordering, and preview functionality
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PhotoUploadZone } from '@/components/photos/PhotoUploadZoneV2';
import { PhotoGallery } from '@/components/photos/PhotoGalleryV3';
import { PhotoPreviewModal } from '@/components/photos/PhotoPreviewModal';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { useAddPropertyStore } from '../../store';
import type { Photo, PhotoFile, PhotoReorderItem } from '@/types/photo';

interface PhotosPageClientProps {
  propertyId: number;
  initialPhotos: Photo[];
  locale: string;
}

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;

export function PhotosPageClient({
  propertyId,
  initialPhotos,
}: PhotosPageClientProps) {
  const t = useTranslations('PhotoUpload');
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);

  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Photo upload hook
  const { uploadPhotos, uploadQueue, isUploading, cancelUpload, retryUpload } =
    usePhotoUpload({
      propertyId,
      onSuccess: (newPhotos) => {
        setPhotos((prev) => [...prev, ...newPhotos]);
        toast.success(
          t('messages.uploadSuccess', { count: newPhotos.length }),
          {
            description: t('messages.uploadSuccessDescription'),
          },
        );
      },
      onError: (error) => {
        toast.error(t('messages.uploadError'), {
          description: error.message,
        });
      },
      options: {
        maxFiles: MAX_PHOTOS,
        maxSizeInMB: 10,
        compressImages: true,
        quality: 0.85,
      },
    });

  // Set current step on mount
  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  // Validation: enable Next if we have minimum photos
  const canProceed = useMemo(() => {
    return (
      photos.length >= MIN_PHOTOS &&
      !isUploading &&
      !isDeleting &&
      !isReordering
    );
  }, [photos.length, isUploading, isDeleting, isReordering]);

  useEffect(() => {
    setCanProceed?.(canProceed);
  }, [canProceed, setCanProceed]);

  // Configure handleNext for layout navigation
  useEffect(() => {
    const handler = async () => {
      if (photos.length < MIN_PHOTOS) {
        toast.error(t('validation.minimumPhotos', { count: MIN_PHOTOS }));
        return;
      }

      // No server-side action needed here, just navigate
      // The layout will handle navigation to next step
    };

    setHandleNext?.(handler);

    return () => {
      setHandleNext?.(undefined);
    };
  }, [photos.length, setHandleNext, t]);

  // Handle file selection
  const handleFilesSelected = useCallback(
    (files: PhotoFile[]) => {
      // Automatically start upload
      uploadPhotos(files);
    },
    [uploadPhotos],
  );

  // Handle photo reordering
  const handleReorder = useCallback(
    async (reorderedPhotos: PhotoReorderItem[]) => {
      setIsReordering(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/property/${propertyId}/reorder`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photos: reorderedPhotos }),
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to reorder photos');
        }

        toast.success(t('messages.reorderSuccess'));
      } catch (error) {
        toast.error(t('messages.reorderError'));
        throw error;
      } finally {
        setIsReordering(false);
      }
    },
    [propertyId, t],
  );

  // Handle photo deletion
  const handleDelete = useCallback(
    async (photoId: number) => {
      setIsDeleting(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/${photoId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to delete photo');
        }

        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [t],
  );

  // Handle set primary photo
  const handleSetPrimary = useCallback(
    async (photoId: number) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/${photoId}/primary`,
          {
            method: 'PATCH',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to set primary photo');
        }

        setPhotos((prev) =>
          prev.map((p) => ({
            ...p,
            isPrimary: p.id === photoId,
          })),
        );
        toast.success(t('messages.primarySuccess'));
      } catch (error) {
        toast.error(t('messages.primaryError'));
        throw error;
      }
    },
    [t],
  );

  // Handle photo preview
  const handlePreview = useCallback((photo: Photo) => {
    setPreviewPhoto(photo);
  }, []);

  // Calculate photo stats
  const photoStats = useMemo(() => {
    const remaining = MAX_PHOTOS - photos.length;
    const needed = Math.max(MIN_PHOTOS - photos.length, 0);
    const progress = Math.min((photos.length / MIN_PHOTOS) * 100, 100);

    return { remaining, needed, progress };
  }, [photos.length]);

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t('title')}
              </CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={photos.length >= MIN_PHOTOS ? 'default' : 'secondary'}
                className="text-lg px-4 py-2"
              >
                {photos.length} / {MAX_PHOTOS}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Progress Bar and Status */}
        {photos.length < MIN_PHOTOS && (
          <CardContent className="pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('validation.minimumRequired', {
                  needed: photoStats.needed,
                  minimum: MIN_PHOTOS,
                })}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {photos.length >= MIN_PHOTOS && (
          <CardContent className="pt-0">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {t('validation.ready')}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('upload.title')}</CardTitle>
          <CardDescription>{t('upload.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploadZone
            uploadQueue={uploadQueue}
            onFilesSelected={handleFilesSelected}
            onCancelUpload={cancelUpload}
            onRetryUpload={retryUpload}
            maxFiles={MAX_PHOTOS}
            maxSizeInMB={10}
            disabled={photos.length >= MAX_PHOTOS || isUploading}
            currentPhotoCount={photos.length}
          />
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('gallery.title')}</CardTitle>
            <CardDescription>{t('gallery.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isReordering ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('gallery.reordering')}
              </div>
            ) : (
              <PhotoGallery
                photos={photos}
                onReorder={handleReorder}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
                onPreview={handlePreview}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {previewPhoto && (
        <PhotoPreviewModal
          photos={photos}
          initialPhotoId={previewPhoto.id}
          isOpen={!!previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          onDelete={handleDelete}
          onSetPrimary={handleSetPrimary}
        />
      )}
    </div>
  );
}
