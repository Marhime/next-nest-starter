'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { PhotoUploadZone } from '@/components/photos/PhotoUploadZone';
import { PhotoGallery } from '@/components/photos/PhotoGallery';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isPrimary: boolean;
}

interface PhotosPageClientProps {
  propertyId: number;
  initialPhotos: Photo[];
  locale: string;
}

export function PhotosPageClient({
  propertyId,
  initialPhotos,
  locale,
}: PhotosPageClientProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);

  // Upload photos
  const handleUpload = async (files: File[]) => {
    setLoading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/property/${propertyId}`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploadedPhotos]);
      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload photos',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reorder photos
  const handleReorder = async (
    reorderedPhotos: { photoId: number; order: number }[],
  ) => {
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

    toast.success('Photos reordered');
  };

  // Delete photo
  const handleDelete = async (photoId: number) => {
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
    toast.success('Photo deleted');
  };

  // Set primary photo
  const handleSetPrimary = async (photoId: number) => {
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
    toast.success('Cover photo updated');
  };

  const handleNext = () => {
    if (photos.length < 5) {
      toast.error('Please upload at least 5 photos before continuing');
      return;
    }
    router.push(`/${locale}/hosting/${propertyId}/about`);
  };

  const handleBack = () => {
    router.push(`/${locale}/hosting/${propertyId}/location`);
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
        <PhotoUploadZone
          onUpload={handleUpload}
          maxFiles={20 - photos.length}
          disabled={loading || photos.length >= 20}
        />
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Your Photos ({photos.length}/20)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Drag photos to reorder them. The first photo will be your cover
            photo.
          </p>
          <PhotoGallery
            photos={photos}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onSetPrimary={handleSetPrimary}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={handleBack} disabled={loading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={loading || photos.length < 5}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Photo Counter Info */}
      {photos.length < 5 && (
        <div className="text-center text-sm text-muted-foreground">
          You need {5 - photos.length} more photo
          {5 - photos.length > 1 ? 's' : ''} to continue
        </div>
      )}
    </div>
  );
}
