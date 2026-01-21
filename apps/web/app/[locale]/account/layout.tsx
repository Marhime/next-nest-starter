'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Account');
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  // If not authenticated, redirect to login with return path
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full md:w-64">
              <div className="bg-card p-4 rounded-lg sticky top-6">
                <nav className="space-y-2">
                  <Link
                    href="/account/listings"
                    className={cn(
                      'block py-2 px-3 rounded hover:bg-muted transition-colors',
                      pathname?.includes('/account/listings') &&
                        'bg-muted font-medium',
                    )}
                  >
                    {t('nav.listings')}
                  </Link>
                  <Link
                    href="/account/favorites"
                    className={cn(
                      'block py-2 px-3 rounded hover:bg-muted transition-colors',
                      pathname?.includes('/account/favorites') &&
                        'bg-muted font-medium',
                    )}
                  >
                    {t('nav.favorites')}
                  </Link>
                  <Link
                    href="/account/settings"
                    className={cn(
                      'block py-2 px-3 rounded hover:bg-muted transition-colors',
                      pathname?.includes('/account/settings') &&
                        'bg-muted font-medium',
                    )}
                  >
                    {t('nav.settings')}
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
    </>
  );
}
