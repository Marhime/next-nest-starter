/**
 * Mobile List Button Component
 * Floating button on mobile to open the properties drawer
 */

'use client';

import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { useMediaQuery } from '@/hooks/use-media-query';

export function MobileListButton() {
  const { properties, setMobileDrawerOpen } = useSearchStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Only show on mobile
  if (isDesktop) {
    return null;
  }

  const propertiesCount = properties?.length ?? 0;

  return (
    <Button
      onClick={() => setMobileDrawerOpen(true)}
      className="fixed bottom-[calc(68px+20px)] left-1/2 -translate-x-1/2 z-50 shadow-lg gap-2"
      size="lg"
    >
      <List className="w-5 h-5" />
      Voir les propriétés ({propertiesCount})
    </Button>
  );
}
