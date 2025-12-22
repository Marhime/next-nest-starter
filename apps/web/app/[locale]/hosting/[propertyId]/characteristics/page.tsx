'use client';

import { useParams } from 'next/navigation';
import { AboutPageClient, AboutProperty } from '../about/AboutPageClient';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';

export default function CharacteristicsPage() {
  const params = useParams();
  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading, isError } = useProperty(propertyId || '');
  const t = useTranslations('PropertyForm');

  if (isLoading) return <div className="p-6">{t('messages.loading')}</div>;
  if (isError || !property)
    return <div className="p-6">{t('messages.updateError')}</div>;

  return <AboutPageClient property={property as unknown as AboutProperty} />;
}
