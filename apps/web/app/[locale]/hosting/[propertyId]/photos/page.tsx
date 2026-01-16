'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PhotosPageClient } from './PhotosPageClient';
import type { Photo } from '@/types/photo';

const PhotosPage = () => {
  const { propertyId } = useParams<{
    propertyId: string;
  }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('yo');
    const fetchPhotos = async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const tokenKey = `property-edit-token:${propertyId}`;
      const editToken =
        (typeof window !== 'undefined' && localStorage.getItem(tokenKey)) ||
        undefined;
      console.log(editToken);
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
