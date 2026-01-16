'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAddPropertyStore } from '../../store';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
// LocationSearchInput removed: single-step map used instead
import { AddressConfirmForm } from '@/components/location/AddressConfirmForm';
import 'leaflet/dist/leaflet.css';
import '@/app/leaflet-custom.css';

// Type temporaire pour les champs qui ne sont pas encore dans le type Property
interface PropertyWithLocation extends Record<string, unknown> {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | string;
  longitude?: number | string;
}

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import('@/components/location/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface AddressFormData {
  street: string;
  buildingInfo: string;
  buildingName: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
}

const LocationPage = () => {
  const t = useTranslations('LocationForm');
  const router = useRouter();
  const { propertyId } = useParams();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );
  const {
    property,
    isLoading: isLoadingProperty,
    mutate,
  } = useProperty(propertyId as string);

  // Single-step flow: user places/adjusts marker (point) or zone center, then optionally edits address
  // Removed multi-phase state in favor of a single consolidated screen
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectionMode, setSelectionMode] = useState<'point' | 'zone'>('point');
  const [zoneRadiusMeters, setZoneRadiusMeters] = useState<number>(500);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    street: '',
    buildingInfo: '',
    buildingName: '',
    postalCode: '',
    city: '',
    state: '',
    country: 'FR',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  useEffect(() => {
    // Location is now step index 0 in the new flow
    setCurrentStep?.(0);
  }, [setCurrentStep]);

  // Validation: allow proceeding if coordinates exist
  useEffect(() => {
    const isValid = coordinates !== null;

    console.log('Location validation:', {
      coordinates,
      isValid,
      addressForm,
    });

    setCanProceed?.(isValid);

    // Mark location step complete when coordinates present
    if (isValid && propertyId) {
      setPropertyProgress?.(Number(propertyId), 0, true);
    }
  }, [
    coordinates,
    addressForm,
    setCanProceed,
    propertyId,
    setPropertyProgress,
  ]);

  // Load existing property data
  useEffect(() => {
    if (property) {
      const hasExistingData = property.address && property.city;
      const extendedProperty = property as unknown as PropertyWithLocation;

      setAddressForm({
        street: property.address || '',
        buildingInfo: '',
        buildingName: '',
        postalCode: extendedProperty.postalCode || '',
        city: property.city || '',
        state: property.state || '',
        country: extendedProperty.country || 'MX',
      });

      const propLatitude = extendedProperty.latitude;
      const propLongitude = extendedProperty.longitude;

      if (propLatitude && propLongitude) {
        // Convertir Decimal en number
        const lat =
          typeof propLatitude === 'number'
            ? propLatitude
            : parseFloat(String(propLatitude));
        const lng =
          typeof propLongitude === 'number'
            ? propLongitude
            : parseFloat(String(propLongitude));

        setCoordinates({ lat, lng });
        // keep editingAddress false by default; user can open edit if they want
        if (hasExistingData) {
          // keep address displayed
        }
      }
    }
  }, [property]);

  // Note: location search input was removed in favour of the single-step map.

  // Allow setting selection mode (point vs zone)
  const handleSelectionModeChange = (mode: 'point' | 'zone') => {
    setSelectionMode(mode);
  };

  const handleFormChange = (field: keyof AddressFormData, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMarkerDragEnd = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });

    // Reverse geocoding pour mettre à jour l'adresse
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      if (data.address) {
        setAddressForm({
          street:
            `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
          buildingInfo: '',
          buildingName: '',
          postalCode: data.address.postcode || '',
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            '',
          state: data.address.state || '',
          country: data.address.country_code?.toUpperCase() || 'FR',
        });
        toast.success(t('messages.addressUpdated'));
      } else {
        toast.info(t('messages.positionUpdated'));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.info(t('messages.positionUpdated'));
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation: require coordinates (either point or zone). Address is optional.
      if (!coordinates) {
        toast.error(t('messages.selectAddress'));
        return;
      }

      setIsSubmitting(true);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const payload: Record<string, unknown> & { landSurface?: number } = {
          // address fields are optional — include if present
          ...(addressForm.street ? { address: addressForm.street } : {}),
          ...(addressForm.city ? { city: addressForm.city } : {}),
          state: addressForm.state || null,
          ...(addressForm.postalCode
            ? { postalCode: addressForm.postalCode }
            : {}),
          country: addressForm.country,
          latitude: Number(coordinates.lat),
          longitude: Number(coordinates.lng),
        };

        // If the user selected a zone, include approximate area (store in landSurface as m²)
        if (selectionMode === 'zone' && zoneRadiusMeters > 0) {
          const areaMeters2 = Math.PI * Math.pow(zoneRadiusMeters, 2);
          // round to 2 decimals
          // store approx area in landSurface (backend currently supports this field)
          payload.landSurface = Number(areaMeters2.toFixed(2));
        }

        console.log('Sending location data:', payload);

        // Include edit token header if present in localStorage (anonymous flow)
        const tokenKey = `property-edit-token:${propertyId}`;
        const editToken =
          (typeof window !== 'undefined' && localStorage.getItem(tokenKey)) ||
          undefined;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        console.log(editToken);
        if (editToken) {
          headers['x-edit-token'] = editToken;
        }

        const updatePromise = fetch(`${API_URL}/properties/${propertyId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers,
          body: JSON.stringify(payload),
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update property');
          }
          return response.json();
        });

        try {
          // Await the update and be silent on success. Surface errors only.
          await updatePromise;
        } catch (err) {
          console.error('Failed to update property (location):', err);
          const message =
            err && typeof err === 'object' && 'message' in err
              ? (err as Error).message
              : String(err);
          toast.error(message || t('messages.updateError'));
          throw err;
        }

        mutate(); // Refresh data

        // Navigate to next step
        router.push(`/hosting/${propertyId}/photos`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      addressForm,
      coordinates,
      propertyId,
      router,
      mutate,
      t,
      selectionMode,
      zoneRadiusMeters,
    ],
  );

  // Register Next handler: directly submit the single-step location form
  useEffect(() => {
    const handler = async () => {
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSubmit(syntheticEvent);
    };

    setHandleNext?.(handler);

    return () => setHandleNext?.(undefined);
  }, [setHandleNext, handleSubmit]);

  if (isLoadingProperty) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full justify-center items-center p-4">
      <Card className="w-full max-w-4xl border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-4xl">{t('titles.search')}</CardTitle>
          <CardDescription>{t('descriptions.search')}</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {/* Selection mode: exact point or approximate zone */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <Button
                variant={selectionMode === 'point' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectionModeChange('point')}
              >
                {t('buttons.point') || 'Point'}
              </Button>
              <Button
                variant={selectionMode === 'zone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectionModeChange('zone')}
              >
                {t('buttons.zone') || 'Zone (500m)'}
              </Button>
            </div>

            {selectionMode === 'zone' && (
              <div className="ml-4 flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  {t('labels.radius') || 'Radius (m)'}:
                </label>
                <input
                  type="number"
                  value={zoneRadiusMeters}
                  min={50}
                  max={2000}
                  onChange={(e) => setZoneRadiusMeters(Number(e.target.value))}
                  className="w-24 rounded border px-2 py-1"
                />
              </div>
            )}
          </div>
          {/* Single-step location UI */}
          <div className="space-y-6">
            {/* <LocationSearchInput
              onLocationSelect={handleLocationSelect}
              className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[calc(100%-5rem)] shadow-md rounded-xl z-10 bg-white p-5"
              defaultValue={
                property?.address
                  ? `${property.address}, ${property.city || ''}`
                  : ''
              }
            /> */}

            {/* Address summary / edit */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              {!editingAddress ? (
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {addressForm.street || t('messages.noAddressYet')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addressForm.postalCode} {addressForm.city}
                        {addressForm.state && `, ${addressForm.state}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addressForm.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAddress(true)}
                    >
                      {t('buttons.modifyAddress') || 'Edit address'}
                    </Button>
                  </div>
                </div>
              ) : (
                <AddressConfirmForm
                  formData={addressForm}
                  onChange={handleFormChange}
                />
              )}
            </div>

            {/* Map (marker or zone) */}
            <div className="rounded-lg overflow-hidden border">
              <MapView
                latitude={coordinates?.lat || 15.865}
                longitude={coordinates?.lng || -97.07}
                zoom={coordinates ? 15 : 13}
                className="h-[700px] w-full"
                markerTitle={t('messages.dragMarker')}
                draggableMarker={true}
                showMarker={true}
                onMarkerDragEnd={handleMarkerDragEnd}
                selectionMode={selectionMode}
                zoneRadiusMeters={zoneRadiusMeters}
                onMapClick={async (lat: number, lng: number) => {
                  setCoordinates({ lat, lng });
                  try {
                    const response = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
                    );

                    if (response.ok) {
                      const data = await response.json();
                      if (data && data.address) {
                        setAddressForm({
                          street:
                            `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
                          buildingInfo: '',
                          buildingName: '',
                          postalCode: data.address.postcode || '',
                          city:
                            data.address.city ||
                            data.address.town ||
                            data.address.village ||
                            '',
                          state: data.address.state || '',
                          country: data.address.country_code
                            ? data.address.country_code.toUpperCase()
                            : 'FR',
                        });
                        toast.success(t('messages.addressUpdated'));
                      }
                    }
                  } catch {
                    // ignore reverse geocode errors
                  }
                  setEditingAddress(false);
                }}
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {t('messages.mapInstructions')}
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                type="button"
                onClick={() => setEditingAddress(true)}
                disabled={isSubmitting}
              >
                {t('buttons.modifyAddress')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPage;
