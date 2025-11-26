/**
 * Universal Location Search Bar
 * Reusable component for location search with autocomplete
 * Uses React Query for optimized caching
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  autoFocus?: boolean;
}

export function LocationSearchBar({
  onLocationSelect,
  placeholder = 'Rechercher une adresse...',
  defaultValue = '',
  className,
  showCurrentLocationButton = true,
  countryCodes,
  autoFocus = false,
}: LocationSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Show results when available
  useEffect(() => {
    if (results.length > 0 && query.length >= 3) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [results, query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Handle location selection
  const handleSelectLocation = useCallback(
    (location: GeocodingResult) => {
      setQuery(location.display_name);
      setIsOpen(false);
      onLocationSelect(location);
    },
    [onLocationSelect],
  );

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
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoading =
    isSearching || currentLocation.isPending || reverseGeocode.isPending;

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            autoFocus={autoFocus}
            aria-label={placeholder}
            aria-autocomplete="list"
            aria-controls="location-results"
            aria-expanded={isOpen}
          />
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {showCurrentLocationButton && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            title="Utiliser ma position actuelle"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error messages */}
      {currentLocation.isError && (
        <p className="text-sm text-destructive mt-1" role="alert">
          Impossible d&apos;accéder à votre position
        </p>
      )}
      {reverseGeocode.isError && (
        <p className="text-sm text-destructive mt-1" role="alert">
          Impossible de récupérer l&apos;adresse
        </p>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          id="location-results"
          className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
          role="listbox"
        >
          {results.map((result, index) => (
            <button
              key={result.place_id}
              type="button"
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b last:border-b-0',
                selectedIndex === index && 'bg-accent',
              )}
              onClick={() => handleSelectLocation(result)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
