/**
 * Search Filters Button
 * Opens the SearchFiltersModal
 * Reusable on home page and /find page
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Search, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFiltersModal } from './SearchFiltersModal';
import { useSearchStore } from '@/stores/search-store';
import { IconMagnetFilled } from '@tabler/icons-react';

interface SearchFiltersButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'compact' | 'home' | 'find';
  className?: string;
}

export function SearchFiltersButton({
  variant = 'default',
  className,
}: SearchFiltersButtonProps) {
  const t = useTranslations('SearchFilters');
  const [isOpen, setIsOpen] = useState(false);
  const { location, listingType, minPrice, maxPrice } = useSearchStore();

  const isHome = variant === 'home';
  const isFind = variant === 'find';

  // Count active filters
  const activeFiltersCount = [location, listingType, minPrice, maxPrice].filter(
    Boolean,
  ).length;

  // Default/Outline/Secondary variants

  return (
    <>
      <Button
        variant="default"
        className={cn(
          'flex gap-2 flex-1 text-black ',
          className,
          isHome && 'w-full py-6',
        )}
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon className="block" />
        <span className="block">Commencer ma recherche</span>
      </Button>

      <SearchFiltersModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );

  // Default/Outline/Secondary variants
  return (
    <>
      <Button
        variant="default"
        className={cn('gap-2  py-2 text-black', className)}
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>{t('filters')}</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-foreground text-primary">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <SearchFiltersModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
