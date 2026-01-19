'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PhotosPageClient } from './PhotosPageClient';
import { useEditToken } from '@/hooks/use-edit-token';
import type { Photo } from '@/types/photo';

const PhotosPage = () => {
  const { propertyId } = useParams<{
    propertyId: string;
  }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { token: editToken } = useEditToken(propertyId);

  useEffect(() => {
    const fetchPhotos = async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use token directly from hook
      if (editToken) {
        headers['x-edit-token'] = editToken;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/property/${propertyId}`,
          {
            credentials: 'include',
            cache: 'no-store',
            headers,
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
  }, [propertyId, editToken]);

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
