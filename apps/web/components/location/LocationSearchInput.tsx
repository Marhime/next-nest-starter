'use client';

import React from 'react';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { useTranslations } from 'next-intl';

// Re-export type for backward compatibility
export type LocationResult = GeocodingResult;

interface LocationSearchInputProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

/**
 * LocationSearchInput - Wrapper for backward compatibility
 * Uses the new reusable LocationSearchBar component
 */
export function LocationSearchInput({
  onLocationSelect,
  placeholder,
  defaultValue = '',
  className,
}: LocationSearchInputProps) {
  const t = useTranslations('LocationForm');

  return (
    <LocationSearchBar
      onLocationSelect={onLocationSelect}
      placeholder={placeholder || t('labels.searchPlaceholder')}
      defaultValue={defaultValue}
      className={className}
      showCurrentLocationButton={true}
    />
  );
}
