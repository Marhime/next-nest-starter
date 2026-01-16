'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { JAWG_TILE_URL, JAWG_ATTRIBUTION } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Next.js
const iconRetinaUrl =
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl =
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

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
      // Configure default icon
      L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
      });

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
