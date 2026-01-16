'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ProfileSettingsPage() {
  const t = useTranslations('Profile');
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending)
    return <div className="p-6">{t('loading') || 'Chargement...'}</div>;
  if (!session?.user) {
    // Redirect to login
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">
        {t('settingsTitle') || 'Paramètres du profil'}
      </h1>

      <div className="bg-card p-6 rounded-lg">
        <p className="mb-4">Email: {session.user.email}</p>
        <p className="mb-4">Nom: {session.user.name || '-'}</p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/profile/photos')}>
            {t('editPhotos') || 'Gérer les photos'}
          </Button>
        </div>
      </div>
    </div>
  );
}
