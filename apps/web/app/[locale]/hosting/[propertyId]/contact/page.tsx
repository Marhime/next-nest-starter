'use client';

import { useParams } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';

export default function ContactPage() {
  const params = useParams();
  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading, isError } = useProperty(propertyId || '');
  const t = useTranslations('PropertyForm');
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );

  useEffect(() => {
    // Description step is index 3 in the new flow (unchanged)
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  if (isLoading) return <div className="p-6">{t('messages.loading')}</div>;
  if (isError || !property)
    return <div className="p-6">{t('messages.updateError')}</div>;

  return <div>Contact</div>;
}
