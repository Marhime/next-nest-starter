/**
 * Simple Location Search Bar - Sans bugs d'auto-open
 *
 * Minimaliste et stable :
 * - Dropdown s'ouvre SEULEMENT au clic sur l'input
 * - Pas d'auto-open intempestif
 * - UI épurée avec navigation clavier
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocationSearch, type GeocodingResult } from '@/hooks/use-geocoding';

interface LocationSearchBarProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  countryCodes?: string;
}

export function LocationSearchBar({
  onLocationSelect,
  placeholder = 'Rechercher une adresse...',
  defaultValue = '',
  className,
  countryCodes,
}: LocationSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search SEULEMENT si dropdown est ouverte ET 3+ caractères
  const shouldSearch = query.length >= 3 && isOpen;
  const { data: results = [], isLoading } = useLocationSearch(
    query,
    countryCodes,
    shouldSearch,
  );

  // Handle location selection
  const handleSelectLocation = useCallback(
    (location: GeocodingResult) => {
      console.log(
        '🎯 LocationSearchBar - Location selected:',
        location.display_name,
      );
      setQuery(location.display_name);
      setIsOpen(false);
      setSelectedIndex(-1);
      onLocationSelect(location);
    },
    [onLocationSelect],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      // Open dropdown on Enter if closed
      if (e.key === 'Enter' && !isOpen && query.length >= 3) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectLocation(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      <div className="relative h-full">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)} // ✅ S'ouvre au CLIC uniquement
          placeholder={placeholder}
          className="pl-9 pr-9 h-full"
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Effacer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown - SEULEMENT affiché quand explicitement ouvert */}
      {isOpen && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Aucune adresse trouvée
            </div>
          ) : (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={result.place_id}
                  type="button"
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3',
                    selectedIndex === index && 'bg-accent',
                  )}
                  onClick={() => handleSelectLocation(result)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
