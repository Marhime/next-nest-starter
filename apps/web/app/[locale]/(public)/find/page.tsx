/**
 * Property Search Page
 * Main page for searching and browsing properties with interactive map
 */

'use client';

import dynamic from 'next/dynamic';
import { PropertySidebar } from '@/components/property-search/PropertySidebar';
import { MobileListButton } from '@/components/property-search/MobileListButton';
import { MobileSearchBar } from '@/components/property-search/MobileSearchBar';
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
      <PropertySidebar />

      {/* Map Container - Fixed behind on mobile, flexible on desktop */}
      <div className="fixed right-0 max-md:left-0 top-[69px] md:flex-1 md:sticky h-[calc(100vh-69px)] z-2 overflow-hidden">
        <PropertyMap className="md:4 xl:p-10 w-full h-full" />
      </div>

      {/* Mobile floating button to open drawer */}
      <MobileListButton />
    </div>
  );
}

export default function FindPage() {
  return <PropertySearchContent />;
}
