'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProperty } from '@/hooks/use-properties';
import { useEditToken } from '@/hooks/use-edit-token';
import { useTranslations } from 'next-intl';
import { AboutPageClient } from './AboutPageClient';

export default function AboutPage() {
  const t = useTranslations('PropertyForm');
  const { propertyId } = useParams<{ propertyId: string }>();
  const { token: editToken } = useEditToken(propertyId);

  const { property, isLoading } = useProperty(propertyId, editToken);

  if (isLoading) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <p className="text-muted-foreground">{t('messages.updateError')}</p>
      </div>
    );
  }

  return <AboutPageClient property={property as any} />;
}
