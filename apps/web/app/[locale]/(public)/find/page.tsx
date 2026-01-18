/**
 * Property Search Page
 * Main page for searching and browsing properties with interactive map
 */

'use client';

import dynamic from 'next/dynamic';
import { PropertyResultList } from '@/components/property-search/PropertyResultList';
import { MobileListButton } from '@/components/property-search/MobileListButton';
import '@/app/leaflet-clusters.css';

// Dynamic import for map to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () =>
    import('@/components/property-search/PropertyMap').then(
      (mod) => mod.PropertyMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#cce7fc]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Chargement de la carte...
          </p>
        </div>
      </div>
    ),
  },
);

function PropertySearchContent() {
  return (
    <div className="relative md:flex min-h-screen">
      {/* PropertySidebar - Renders as drawer on mobile, sidebar on desktop */}
      <PropertyResultList />

      {/* Map Container - Fixed behind on <TileLayer mobile, flexible on desktop */}
      <div className="fixed right-0 max-md:left-0 top-[89px] md:flex-1 md:sticky h-[calc(100vh-89px)] z-2 overflow-hidden">
        <PropertyMap className="md:pr-4 xl:pr-12 xl:py-8 w-full h-full" />
      </div>

      {/* Mobile floating button to open drawer */}
      <MobileListButton />
    </div>
  );
}

export default function FindPage() {
  return <PropertySearchContent />;
}
