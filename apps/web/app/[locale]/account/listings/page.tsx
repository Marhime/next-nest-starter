'use client';

import React from 'react';
import { PropertyList } from '@/components/property-creation/PropertyList';
import { useTranslations } from 'next-intl';

export default function AccountListingsPage() {
  const t = useTranslations('Account');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('nav.listings')}</h1>
      </div>

      <section>
        <PropertyList />
      </section>
    </div>
  );
}
