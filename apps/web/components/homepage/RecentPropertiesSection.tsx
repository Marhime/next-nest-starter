import React from 'react';
import Link from 'next/link';
import RecentPropertiesList from './RecentPropertiesList';
import { ListingType } from '@/hooks/use-create-property';

type RecentPropertiesSectionProps = {
  listingType?: ListingType;
};

const RecentPropertiesSection = ({
  listingType,
}: RecentPropertiesSectionProps) => {
  return (
    <div className="pt-12 md:pt-14">
      <div className="container">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-3xl font-semibold">
            Décourvrez nos dernières propriétés
          </h2>
          <div className="flex justify-between items-end">
            <p className="text-muted-foreground mt-4">
              Parcourez les dernières propriétés ajoutées à notre plateforme.
            </p>
            <Link
              href="/find"
              className="px-4 py-2 rounded-lg text-sm font-semibold hover:underline text-gray-500"
            >
              Voir toutes les propriétés
            </Link>
          </div>
        </div>
        <RecentPropertiesList listingType={listingType} />
      </div>
    </div>
  );
};

export default RecentPropertiesSection;
