/**
 * Property Map Component
 * Interactive map with property markers and clustering
 * Now using unified search store
 */

'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import {
  useSearchStore,
  type Property,
  type PropertyMarker as PropertyMarkerType,
} from '@/stores/search-store';
import { JAWG_TILE_URL, JAWG_ATTRIBUTION } from '@/lib/constants';
import { PropertyCardFloating } from './PropertyCardFloating';
import 'leaflet/dist/leaflet.css';
import { PropertyDetailsModal } from './PropertyDetailsModal';

// Component to update map view based on store state
function MapViewController() {
  const map = useMap();
  const { mapCenter, mapZoom, sidebarWidth } = useSearchStore();

  useEffect(() => {
    map.setView(mapCenter, mapZoom);
  }, [map, mapCenter, mapZoom]);

  // Handle map invalidation when sidebar resizes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      map.invalidateSize();

      // Update bounds after resize
      const bounds = map.getBounds();
      if (bounds) {
        const { setMapBounds } = useSearchStore.getState();
        setMapBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [map, sidebarWidth]);

  return null;
}

const clusterIcon = (cluster: any) => {
  const markers = cluster.getAllChildMarkers();
  const count = cluster.getChildCount();

  const price = markers
    .map((m: any) => m.options.price)
    .sort((a: number, b: number) => a - b)
    .slice(0, 1);

  return L.divIcon({
    className: 'airbnb-cluster',
    html: `
      <div class="cluster-inner">
        <div class="cluster-count">${count}</div>
      </div>
    `,
    iconSize: [90, 90],
  });
};

// Component to handle map events (with debounce for bounds)
function MapEventHandler() {
  const { setMapCenter, setMapZoom, setMapBounds } = useSearchStore();
  const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);

      // Debounce bounds update (500ms)
      if (boundsTimeoutRef.current) {
        clearTimeout(boundsTimeoutRef.current);
      }

      boundsTimeoutRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        setMapBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }, 1000); // ✅ 1000ms: Réduit les appels API pendant navigation carte
    },
    zoomend: () => {
      setMapZoom(map.getZoom());
    },
  });

  return null;
}

// Property marker component (now uses PropertyMarkerType)
const PropertyMarkerComponent = React.memo(function PropertyMarkerComponent({
  marker,
}: {
  marker: PropertyMarkerType;
}) {
  const { selectProperty, selectedPropertyId } = useSearchStore();

  const handleClick = useCallback(() => {
    selectProperty(marker.id);
  }, [marker.id, selectProperty]);

  if (!marker.latitude || !marker.longitude) {
    return null;
  }

  console.log(marker);

  const icon = L.divIcon({
    className: `price-marker ${selectedPropertyId === marker.id ? 'active' : ''}`,
    html: `<span class="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden bg-white">€${marker.price}</span>`,
    iconSize: [52, 30],
    iconAnchor: [26, 15],
  });

  const position: [number, number] = [marker.latitude, marker.longitude];

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
});

export function PropertyMap({ className }: { className?: string }) {
  const {
    mapCenter,
    mapZoom,
    properties,
    mapMarkers,
    selectedPropertyId,
    selectProperty,
  } = useSearchStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected property for floating card (from full properties list)
  const selectedProperty = useMemo(
    () => properties.find((p: Property) => p.id === selectedPropertyId),
    [properties, selectedPropertyId],
  );

  // Use mapMarkers for displaying all points on the map (lightweight)
  const validMarkers = useMemo(
    () => mapMarkers.filter((m) => m.latitude !== null && m.longitude !== null),
    [mapMarkers],
  );

  if (!JAWG_ATTRIBUTION || !JAWG_TILE_URL || !mapCenter || !mapZoom) return;

  return (
    <div ref={containerRef} className={className}>
      <div className="relative h-full z-10 rounded-2xl overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ backgroundColor: '#f8f4f0' }}
        >
          <TileLayer
            attribution={JAWG_ATTRIBUTION}
            url={JAWG_TILE_URL}
            maxZoom={22}
          />

          <MapViewController />
          <MapEventHandler />

          {/* <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            maxClusterRadius={50}
            iconCreateFunction={clusterIcon}
          > */}
          {validMarkers.map((marker) => (
            <PropertyMarkerComponent key={marker.id} marker={marker} />
          ))}
          {/* </MarkerClusterGroup> */}
        </MapContainer>

        {/* Floating Property Card */}
        {selectedProperty && (
          <PropertyCardFloating
            property={selectedProperty}
            onClose={() => selectProperty(null)}
          />
        )}
        <PropertyDetailsModal />
      </div>
    </div>
  );
}
