/**
 * Property Map Component
 * Interactive map with property markers and clustering
 * Now using unified search store
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
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

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.svg',
  iconRetinaUrl: '/marker-icon.svg',
  shadowUrl: '/marker-shadow.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = icon;

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
      }, 500);
    },
    zoomend: () => {
      setMapZoom(map.getZoom());
    },
  });

  return null;
}

// Property marker component (now uses PropertyMarkerType)
function PropertyMarkerComponent({ marker }: { marker: PropertyMarkerType }) {
  const { selectProperty } = useSearchStore();

  if (!marker.latitude || !marker.longitude) {
    return null;
  }

  const position: [number, number] = [marker.latitude, marker.longitude];

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => selectProperty(marker.id),
      }}
    />
  );
}

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

          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            maxClusterRadius={50}
          >
            {validMarkers.map((marker) => (
              <PropertyMarkerComponent key={marker.id} marker={marker} />
            ))}
          </MarkerClusterGroup>
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
