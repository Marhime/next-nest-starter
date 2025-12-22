'use client';

import { useParams } from 'next/navigation';
import { AboutPageClient } from './AboutPageClient';
import type { AboutProperty } from './AboutPageClient';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const params = useParams();
  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading, isError } = useProperty(propertyId || '');
  const t = useTranslations('PropertyForm');

  if (isLoading) return <div className="p-6">{t('messages.loading')}</div>;
  if (isError || !property)
    return <div className="p-6">{t('messages.updateError')}</div>;

  const p = property as unknown as Partial<AboutProperty> & { id: number };

  const safeProperty: AboutProperty = {
    id: p.id,
    title: p.title || '',
    description: p.description,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    capacity: p.capacity,
    floor: p.floor,
    area: p.area,
    amenities: p.amenities,
    status: (p.status as string) || 'DRAFT',
    propertyType: (p.propertyType as string) || 'HOUSE',
    listingType: p.listingType,
  };

  return <AboutPageClient property={safeProperty} />;
}
