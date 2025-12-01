/**
 * Modern Location Search Bar (shadcn style)
 *
 * A clean search input with dropdown results - no button required
 * Features:
 * - Direct input field with icon
 * - Auto-opening dropdown on focus/typing
 * - Real-time search with React Query caching
 * - Keyboard navigation (arrows, enter, escape)
 * - Optional geolocation button
 *
 * Built with shadcn/ui components and following project best practices
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useLocationSearch,
  useCurrentLocation,
  useReverseGeocode,
  type GeocodingResult,
} from '@/hooks/use-geocoding';

interface LocationSearchBarProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  showCurrentLocationButton?: boolean;
  countryCodes?: string;
}

export function LocationSearchBar({
  onLocationSelect,
  placeholder = 'Rechercher une adresse...',
  defaultValue = '',
  className,
  showCurrentLocationButton = true,
  countryCodes,
}: LocationSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search with React Query
  const { data: results = [], isLoading: isSearching } = useLocationSearch(
    query,
    countryCodes,
    query.length >= 3,
  );

  // Current location mutation
  const currentLocation = useCurrentLocation();
  const reverseGeocode = useReverseGeocode();

  // Auto-open dropdown when results available (but not if user already selected something)
  useEffect(() => {
    if (hasSelectedLocation) return;

    if (results.length > 0 && query.length >= 3) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else if (query.length < 3) {
      setIsOpen(false);
    }
  }, [results, query, hasSelectedLocation]);

  // Handle location selection
  const handleSelectLocation = useCallback(
    (location: GeocodingResult) => {
      setQuery(location.display_name);
      setIsOpen(false);
      setSelectedIndex(-1);
      setHasSelectedLocation(true);
      onLocationSelect(location);
    },
    [onLocationSelect],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHasSelectedLocation(false); // User is typing again, allow dropdown
    if (value.length >= 3) {
      setIsOpen(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

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

  // Get current location
  const handleUseCurrentLocation = async () => {
    try {
      const coords = await currentLocation.mutateAsync();
      const location = await reverseGeocode.mutateAsync(coords);
      handleSelectLocation(location);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    setHasSelectedLocation(false);
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

  const isLoading =
    isSearching || currentLocation.isPending || reverseGeocode.isPending;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1" ref={containerRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (
                  !hasSelectedLocation &&
                  results.length > 0 &&
                  query.length >= 3
                ) {
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              className="pl-9 pr-9 max-md:h-12"
              aria-label={placeholder}
              aria-autocomplete="list"
              aria-controls="location-results"
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

          {/* Dropdown Results */}
          {isOpen && (
            <div
              id="location-results"
              className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto"
              role="listbox"
            >
              {query.length < 3 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Tapez au moins 3 caractères...
                </div>
              ) : isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Aucune adresse trouvée
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    Résultats
                  </div>
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Current Location Button */}
        {showCurrentLocationButton && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            title="Utiliser ma position actuelle"
            className="shrink-0"
          >
            <Navigation className="h-4 w-4" />
            <span className="sr-only">Position actuelle</span>
          </Button>
        )}
      </div>

      {/* Error messages */}
      {currentLocation.isError && (
        <p className="text-sm text-destructive mt-2" role="alert">
          Impossible d&apos;accéder à votre position
        </p>
      )}
      {reverseGeocode.isError && (
        <p className="text-sm text-destructive mt-2" role="alert">
          Impossible de récupérer l&apos;adresse
        </p>
      )}
    </div>
  );
}
