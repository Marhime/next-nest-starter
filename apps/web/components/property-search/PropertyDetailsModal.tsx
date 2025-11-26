/**
 * Property Details Modal
 * Sheet modal for displaying property details
 * Optimized for mobile and desktop
 */

'use client';

import { PropertyCard } from '@/components/property-search/PropertyCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSearchStore } from '@/stores/search-store';
import { Card } from '../ui/card';

export function PropertyDetailsModal() {
  const { selectedPropertyId, properties, selectProperty } = useSearchStore();

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const isOpen = selectedPropertyId !== null && selectedProperty !== undefined;

  const handleClose = () => {
    selectProperty(null);
  };

  if (!selectedProperty) return null;

  return (
    <div className="mt-6" style={{ visibility: isOpen ? 'hidden' : 'visible' }}>
      <PropertyCard property={selectedProperty} />
    </div>
  );
}
