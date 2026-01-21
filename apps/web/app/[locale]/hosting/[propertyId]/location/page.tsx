'use client';

import { useParams } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useEditToken } from '@/hooks/use-edit-token';
import LocationPageClient from './LocationPageClient';

const LocationPage = () => {
  const t = useTranslations('LocationForm');
  const { propertyId } = useParams();
  const { token: editToken } = useEditToken(propertyId as string);

  const { property, isLoading: isLoadingProperty } = useProperty(
    propertyId as string,
    editToken,
  );

  if (isLoadingProperty) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <p className="text-muted-foreground">{t('messages.loadError')}</p>
      </div>
    );
  }

  return <LocationPageClient property={property} />;
};

export default LocationPage;
