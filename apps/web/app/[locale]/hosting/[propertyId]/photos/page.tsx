'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAddPropertyStore } from '../../store';
import { PhotosPageClient } from './PhotosPageClient';
import { Loader2 } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isPrimary: boolean;
}

const PhotosPage = () => {
  const { propertyId, locale } = useParams<{
    propertyId: string;
    locale: string;
  }>();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentStep?.(3);
  }, [setCurrentStep]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/property/${propertyId}`,
          {
            credentials: 'include',
            cache: 'no-store',
          },
        );

        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPhotos();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Photos</h1>
          <p className="text-muted-foreground">
            Upload high-quality photos of your property. The first photo will be
            your cover photo.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Minimum 5 photos required • Maximum 20 photos
          </p>
        </div>

        <PhotosPageClient
          propertyId={parseInt(propertyId)}
          initialPhotos={photos}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default PhotosPage;
