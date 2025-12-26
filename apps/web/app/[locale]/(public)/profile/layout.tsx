'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Profile');
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // If not authenticated, open login modal (client-only behavior)
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      // Redirect to login page (or show modal handled elsewhere)
      router.push('/auth/login');
    }
  }, [isPending, session, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64">
            <div className="bg-card p-4 rounded-lg sticky top-6">
              <nav className="space-y-2">
                <Link
                  href="/profile/listings"
                  className="block py-2 px-3 rounded hover:bg-muted"
                >
                  {t('nav.listings') || 'Mes annonces'}
                </Link>
                <Link
                  href="/profile/settings"
                  className="block py-2 px-3 rounded hover:bg-muted"
                >
                  {t('nav.settings') || 'Paramètres'}
                </Link>
                <Link
                  href="/profile/photos"
                  className="block py-2 px-3 rounded hover:bg-muted"
                >
                  {t('nav.photos') || 'Photos'}
                </Link>
                <Link
                  href="/profile/security"
                  className="block py-2 px-3 rounded hover:bg-muted"
                >
                  {t('nav.security') || 'Sécurité'}
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      {/* Mobile nav */}
      <MobileBottomNav />
    </div>
  );
}
