'use client';

import { useParams } from 'next/navigation';
import DescriptionPageClient from './DescriptionPageClient';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';

export default function DescriptionPage() {
  const params = useParams();
  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading, isError } = useProperty(propertyId || '');
  const t = useTranslations('PropertyForm');

  if (isLoading) return <div className="p-6">{t('messages.loading')}</div>;
  if (isError || !property)
    return <div className="p-6">{t('messages.updateError')}</div>;

  return (
    <DescriptionPageClient
      property={
        property as { id: number; title?: string; description?: string }
      }
    />
  );
}
