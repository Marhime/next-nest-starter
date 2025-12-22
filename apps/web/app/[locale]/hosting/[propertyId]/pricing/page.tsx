'use client';

import { useParams } from 'next/navigation';
import PricingPageClient from './PricingPageClient';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const params = useParams();
  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading, isError } = useProperty(propertyId || '');
  const t = useTranslations('PropertyForm');

  if (isLoading) return <div className="p-6">{t('messages.loading')}</div>;
  if (isError || !property)
    return <div className="p-6">{t('messages.updateError')}</div>;

  return (
    <PricingPageClient
      property={
        property as {
          id: number;
          monthlyPrice?: number;
          nightlyPrice?: number;
          salePrice?: number;
        }
      }
    />
  );
}
