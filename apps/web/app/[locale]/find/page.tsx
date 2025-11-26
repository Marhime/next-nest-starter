/**
 * Property Search Page
 * Main page for searching and browsing properties with interactive map
 */

'use client';

import dynamic from 'next/dynamic';
import { PropertySidebar } from '@/components/property-search/PropertySidebar';
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
    <div className="flex min-h-full min-w-full relative">
      {/* Sidebar */}
      <PropertySidebar />

      {/* Map Container - Prend tout l'espace restant */}
      <div className="flex-1 h-screen transition-all duration-300 z-40">
        <PropertyMap />
      </div>
    </div>
  );
}

export default function FindPage() {
  return <PropertySearchContent />;
}
