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
import { useSearchStore, type Property } from '@/stores/search-store';
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

// Property marker component
function PropertyMarker({ property }: { property: Property }) {
  const {
    selectedPropertyId,
    hoveredPropertyId,
    selectProperty,
    hoverProperty,
  } = useSearchStore();

  const isSelected = selectedPropertyId === property.id;
  const isHovered = hoveredPropertyId === property.id;

  if (!property.latitude || !property.longitude) {
    return null;
  }

  const position: [number, number] = [property.latitude, property.longitude];

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => selectProperty(property.id),
      }}
    />
  );
}

export function PropertyMap({ className }: { className?: string }) {
  const {
    mapCenter,
    mapZoom,
    properties,
    selectedPropertyId,
    selectProperty,
    isLoading,
  } = useSearchStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected property for floating card
  const selectedProperty = useMemo(
    () => properties.find((p: Property) => p.id === selectedPropertyId),
    [properties, selectedPropertyId],
  );

  // Filter properties with valid coordinates
  const validProperties = useMemo(
    () => properties.filter((p: Property) => p.latitude && p.longitude),
    [properties],
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
            {validProperties.map((property) => (
              <PropertyMarker key={property.id} property={property} />
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
