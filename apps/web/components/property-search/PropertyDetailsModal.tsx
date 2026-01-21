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
import { Property, useSearchStore } from '@/stores/search-store';
import { Card } from '../ui/card';

export function PropertyDetailsModal({
  selectedProperty,
}: {
  selectedProperty: Property | null;
}) {
  const { selectProperty } = useSearchStore();

  const isOpen = selectedProperty !== undefined;

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
