'use client';

import { useLatestProperties } from '@/hooks/use-properties';
import React from 'react';
import { PropertyCardSkeleton } from '../property-creation/PropertyList';
import { PropertyCard } from '../property-search';
import { ListingType } from '@/hooks/use-create-property';

type RecentPropertiesListProps = {
  listingType?: ListingType;
};

const RecentPropertiesList = ({ listingType }: RecentPropertiesListProps) => {
  const { properties, isLoading } = useLatestProperties(listingType);

  console.log(properties);
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return null;
  }

  return (
    <div className="pt-8 md:pt-12 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default RecentPropertiesList;
