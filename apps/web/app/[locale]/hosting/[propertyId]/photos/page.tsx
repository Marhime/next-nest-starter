'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProperty } from '@/hooks/use-properties';
import { useEditToken } from '@/hooks/use-edit-token';
import { useTranslations } from 'next-intl';
import PhotosPageClient from './PhotosPageClient';

const PhotosPage = () => {
  const t = useTranslations('PhotoUpload');
  const { propertyId } = useParams<{ propertyId: string }>();
  const { token: editToken } = useEditToken(propertyId);

  const { property, isLoading } = useProperty(propertyId, editToken);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loadError')}</p>
      </div>
    );
  }

  return <PhotosPageClient property={property} />;
};

export default PhotosPage;
