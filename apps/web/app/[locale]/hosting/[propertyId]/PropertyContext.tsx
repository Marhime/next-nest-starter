'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Property } from '@/hooks/use-properties';

interface PropertyContextValue {
  property: Property | undefined;
  isLoading: boolean;
  isError: any;
  mutate: () => Promise<Property | undefined>;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

export function PropertyProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PropertyContextValue;
}) {
  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

/**
 * Hook to access the shared property instance from layout
 * Single source of truth - no duplicate SWR caches!
 */
export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within PropertyProvider');
  }
  return context;
}
