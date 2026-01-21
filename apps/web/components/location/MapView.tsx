'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { JAWG_TILE_URL, JAWG_ATTRIBUTION } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

// Custom minimal marker icon with SVG
const customMarkerIcon = L.divIcon({
  html: `
    <svg width="38px" height="38px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
       <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Dribbble-Light-Preview" transform="translate(-423.000000, -5399.000000)" fill="#2a9d8f">
            <g id="icons" transform="translate(56.000000, 160.000000)">
                <path d="M374,5248.219 C372.895,5248.219 372,5247.324 372,5246.219 C372,5245.114 372.895,5244.219 374,5244.219 C375.105,5244.219 376,5245.114 376,5246.219 C376,5247.324 375.105,5248.219 374,5248.219 M374,5239 C370.134,5239 367,5242.134 367,5246 C367,5249.866 370.134,5259 374,5259 C377.866,5259 381,5249.866 381,5246 C381,5242.134 377.866,5239 374,5239" id="pin_fill_rounded_circle-[#629]">
                </path>
            </g>
        </g>
    </g>
    </svg>
  `,
  className: 'custom-marker-icon',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  markerTitle?: string;
  onMapClick?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  showMarker?: boolean;
  selectionMode?: 'point' | 'zone';
  zoneRadiusMeters?: number;
}

export function MapView({
  latitude,
  longitude,
  zoom = 15,
  className = 'h-[400px] w-full rounded-lg',
  markerTitle = 'Emplacement de votre bien',
  onMapClick,
  draggableMarker = false,
  onMarkerDragEnd,
  showMarker = true,
  selectionMode = 'point',
  zoneRadiusMeters = 0,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't initialize map on server-side
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      // Create map
      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add Jawg Maps tiles (Sunny style) - consistent with PropertyMap
      L.tileLayer(JAWG_TILE_URL, {
        attribution: JAWG_ATTRIBUTION,
        maxZoom: 22,
      }).addTo(map);

      // Add marker only if showMarker is true (marker may be created later when coordinates arrive)
      let marker: L.Marker | null = null;
      if (showMarker) {
        marker = L.marker([latitude, longitude], {
          draggable: draggableMarker,
          title: markerTitle,
          icon: customMarkerIcon,
        }).addTo(map);

        marker.bindPopup(markerTitle).openPopup();

        // Handle marker drag end if callback provided
        if (draggableMarker && onMarkerDragEnd) {
          marker.on('dragend', (e) => {
            const position = e.target.getLatLng();
            onMarkerDragEnd(position.lat, position.lng);
          });
        }
      }

      // Handle map clicks if callback provided
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      mapRef.current = map;
      markerRef.current = marker;
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - dependencies handled in separate effect

  // Update map position and marker when coordinates or display mode change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const newLatLng = L.latLng(latitude, longitude);

    // Animate map to new position
    map.setView(newLatLng, zoom, {
      animate: true,
      duration: 0.5,
    });

    // Ensure marker exists if requested
    if (showMarker) {
      if (!markerRef.current) {
        // create marker dynamically
        const m = L.marker([latitude, longitude], {
          draggable: draggableMarker,
          title: markerTitle,
          icon: customMarkerIcon,
        }).addTo(map);

        if (draggableMarker && onMarkerDragEnd) {
          m.on('dragend', (e) => {
            const position = e.target.getLatLng();
            onMarkerDragEnd(position.lat, position.lng);
          });
        }

        markerRef.current = m;
      } else {
        markerRef.current.setLatLng(newLatLng);
        markerRef.current.bindPopup(markerTitle).openPopup();
      }
    } else {
      // remove marker if exists and not wanted
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }

    // Zone circle handling
    if (selectionMode === 'zone' && zoneRadiusMeters > 0) {
      if (!circleRef.current) {
        const c = L.circle(newLatLng, {
          radius: zoneRadiusMeters,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.12,
        }).addTo(map);
        circleRef.current = c;
      } else {
        circleRef.current.setLatLng(newLatLng);
        circleRef.current.setRadius(zoneRadiusMeters);
      }
    } else {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
    }
  }, [
    latitude,
    longitude,
    zoom,
    markerTitle,
    showMarker,
    draggableMarker,
    onMarkerDragEnd,
    selectionMode,
    zoneRadiusMeters,
  ]);

  return (
    <div className="relative">
      <div ref={containerRef} className={className} />
    </div>
  );
}
