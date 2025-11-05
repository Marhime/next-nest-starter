'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface LocationSearchInputProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function LocationSearchInput({
  onLocationSelect,
  placeholder,
  defaultValue = '',
  className,
}: LocationSearchInputProps) {
  const t = useTranslations('LocationForm');
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchLocation = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Nominatim API - Free geocoding service from OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: searchQuery,
              format: 'json',
              addressdetails: '1',
              limit: '5',
              countrycodes: 'fr,mx', // Ajuste selon tes besoins
            }),
          {
            headers: {
              'Accept-Language': 'fr',
              // Best practice: Include app identifier for Nominatim
              'User-Agent': 'PropertyApp/1.0',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data: LocationResult[] = await response.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Location search error:', err);
        setError(t('messages.cannotSearchAddresses'));
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300); // 300ms debounce
  };

  // Handle location selection
  const handleSelectLocation = (location: LocationResult) => {
    setQuery(location.display_name);
    setIsOpen(false);
    setResults([]);
    onLocationSelect(location);
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
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Get current location using browser geolocation
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError(t('messages.geolocationNotSupported'));
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
              new URLSearchParams({
                lat: position.coords.latitude.toString(),
                lon: position.coords.longitude.toString(),
                format: 'json',
                addressdetails: '1',
              }),
            {
              headers: {
                'Accept-Language': 'fr',
                'User-Agent': 'PropertyApp/1.0',
              },
            },
          );

          if (!response.ok) {
            throw new Error('Failed to reverse geocode');
          }

          const data: LocationResult = await response.json();
          setQuery(data.display_name);
          onLocationSelect(data);
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setError(t('messages.cannotGetAddress'));
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(t('messages.cannotAccessLocation'));
        setIsLoading(false);
      },
    );
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder || t('labels.searchPlaceholder')}
            className="pl-10"
            aria-label={t('labels.searchPlaceholder')}
            aria-autocomplete="list"
            aria-controls="location-results"
            aria-expanded={isOpen}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          title={t('buttons.useCurrentLocation')}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1" role="alert">
          {error}
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
                'w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3',
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
