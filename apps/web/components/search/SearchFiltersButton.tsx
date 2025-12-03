/**
 * Search Filters Button
 * Opens the SearchFiltersModal
 * Reusable on home page and /find page
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFiltersModal } from './SearchFiltersModal';
import { useSearchStore } from '@/stores/search-store';

interface SearchFiltersButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'compact';
  className?: string;
}

export function SearchFiltersButton({
  variant = 'default',
  className,
}: SearchFiltersButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { location, listingType, minPrice, maxPrice } = useSearchStore();

  // Count active filters
  const activeFiltersCount = [location, listingType, minPrice, maxPrice].filter(
    Boolean,
  ).length;

  // Compact variant for home page (mobile)
  if (variant === 'compact') {
    return (
      <>
        <Button
          variant="secondary"
          className={cn(
            'w-full h-14 justify-start gap-3 bg-white hover:bg-white/90 text-foreground shadow-lg',
            className,
          )}
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">
              {location || 'Où allez-vous ?'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {listingType === 'SALE'
                ? 'Acheter'
                : listingType === 'RENT'
                  ? 'Louer'
                  : 'Type'}
              {minPrice || maxPrice
                ? ` · ${minPrice || 0} - ${maxPrice || '∞'} €`
                : ''}
            </p>
          </div>
        </Button>

        <SearchFiltersModal open={isOpen} onOpenChange={setIsOpen} />
      </>
    );
  }

  // Default/Outline/Secondary variants
  return (
    <>
      <Button
        variant={variant === 'default' ? 'default' : variant}
        className={cn('gap-2', className)}
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filtres</span>
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
