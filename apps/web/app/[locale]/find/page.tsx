/**
 * Property Search Page
 * Main page for searching and browsing properties with interactive map
 */

'use client';

import dynamic from 'next/dynamic';
import { PropertySidebar } from '@/components/property-search/PropertySidebar';
import { MobileListButton } from '@/components/property-search/MobileListButton';
import { usePropertyData } from '@/hooks/use-property-data';
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
  // Fetch properties based on unified store filters
  // React Query will automatically refetch when filters change
  usePropertyData();

  return (
    <div className="relative md:flex min-h-[calc(100vh-69px)]">
      {/* Map Container - Fixed behind on mobile, flexible on desktop */}
      <div className="fixed inset-0 top-[69px] md:flex-1 md:relative md:top-0 h-[calc(100vh-69px)] z-0">
        <PropertyMap className="w-full h-full" />
      </div>

      {/* PropertySidebar - Renders as drawer on mobile, sidebar on desktop */}
      <PropertySidebar />

      {/* Mobile floating button to open drawer */}
      <MobileListButton />
    </div>
  );
}

export default function FindPage() {
  return <PropertySearchContent />;
}
