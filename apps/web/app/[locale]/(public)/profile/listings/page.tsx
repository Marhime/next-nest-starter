'use client';

import React from 'react';
import { PropertyList } from '@/components/property-creation/PropertyList';
import { useTranslations } from 'next-intl';

export default function ProfileListingsPage() {
  const t = useTranslations('HostingPage');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {t('welcomeTitle') || 'Mes annonces'}
        </h1>
      </div>

      <section>
        <PropertyList />
      </section>
    </div>
  );
}
