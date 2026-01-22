/**
 * Mobile Bottom Navigation
 * App-style tab navigation for mobile devices
 * Fixed at bottom of screen with proper spacing
 */

'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, Heart, User } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  exactMatch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    icon: Home,
    label: 'Accueil',
    exactMatch: true,
  },
  {
    href: '/find',
    icon: Search,
    label: 'Recherche',
    exactMatch: false,
  },
  {
    href: '/favorites',
    icon: Heart,
    label: 'Favoris',
    exactMatch: false,
  },
  {
    href: '/account',
    icon: User,
    label: 'Account',
    exactMatch: false,
  },
];

export const MOBILE_NAV_HEIGHT = 'pb-20'; // Tailwind class for content padding
export const MOBILE_NAV_HEIGHT_PX = 80; // Actual height in pixels

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exactMatch: boolean = false) => {
    if (exactMatch) {
      // Remove locale prefix for exact match comparison
      const cleanPath = pathname?.replace(/^\/[a-z]{2}/, '') || '/';
      return cleanPath === href || cleanPath === `${href}/`;
    }
    // For non-exact match, check if path starts with href
    return pathname?.includes(href);
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-center gap-10 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full gap-1 transition-colors',
                  'hover:bg-muted/50 rounded-lg',
                  active ? 'text-primary font-medium' : 'text-muted-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-all',
                    active && 'scale-110',
                  )}
                />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button for Add Property - Optional */}
      {/* Uncomment if you want a FAB for adding properties */}
      {/* 
      <div className="md:hidden fixed bottom-24 right-4 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          asChild
        >
          <Link href="/properties/new">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      */}
    </>
  );
}
