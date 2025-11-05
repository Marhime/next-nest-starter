'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PhotosPageClient } from './PhotosPageClientSimple';
import type { Photo } from '@/types/photo';

const PhotosPage = () => {
  const { propertyId } = useParams<{
    propertyId: string;
  }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

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
    <PhotosPageClient
      propertyId={parseInt(propertyId)}
      initialPhotos={photos}
    />
  );
};

export default PhotosPage;
