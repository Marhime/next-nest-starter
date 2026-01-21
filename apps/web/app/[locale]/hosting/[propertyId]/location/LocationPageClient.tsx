'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MapPin, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { LocationSearchBar } from '@/components/shared/LocationSearchBar';
import type { GeocodingResult } from '@/hooks/use-geocoding';
import { useAddPropertyStore } from '../../store';
import { usePropertyForm } from '@/hooks/use-property-form';
import { useStepValidation, STEP_LOCATION } from '@/hooks/use-step-validation';
import 'leaflet/dist/leaflet.css';
import '@/app/leaflet-custom.css';

interface PropertyWithLocation {
  id: number;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

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

const FIXED_ZONE_RADIUS = 500;

interface LocationPageClientProps {
  property: PropertyWithLocation;
}

export function LocationPageClient({ property }: LocationPageClientProps) {
  const t = useTranslations('LocationForm');
  const router = useRouter();
  const { propertyId } = useParams();

  // State
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useExactAddress, setUseExactAddress] = useState(true);
  const [addressData, setAddressData] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'MX',
  });

  // Validate step access
  useStepValidation(STEP_LOCATION, property, false);

  // Validation
  const isValid = coordinates !== null;

  // ✅ Memoize payload to prevent infinite loops
  const payload = useMemo(
    () => ({
      ...(addressData.address ? { address: addressData.address } : {}),
      ...(addressData.city ? { city: addressData.city } : {}),
      state: addressData.state || null,
      ...(addressData.postalCode ? { postalCode: addressData.postalCode } : {}),
      country: addressData.country,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      ...(!useExactAddress &&
        coordinates && {
          landSurface: Number(
            (Math.PI * Math.pow(FIXED_ZONE_RADIUS, 2)).toFixed(2),
          ),
        }),
    }),
    [addressData, coordinates, useExactAddress],
  );

  // ✅ Memoize onSuccess callback
  const handleSuccess = useCallback(() => {
    router.push(`/hosting/${propertyId}/photos`);
  }, [router, propertyId]);

  // Property form integration
  usePropertyForm({
    propertyId: property.id,
    stepIndex: 0,
    isValid,
    payload,
    onSuccess: handleSuccess,
  });

  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  useEffect(() => {
    setCurrentStep?.(0);
  }, [setCurrentStep]);

  // Initialize form data from property
  useEffect(() => {
    if (property) {
      setAddressData({
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        postalCode: property.postalCode || '',
        country: property.country || 'MX',
      });

      const lat = property.latitude;
      const lng = property.longitude;

      if (lat && lng) {
        const latNum = typeof lat === 'number' ? lat : parseFloat(String(lat));
        const lngNum = typeof lng === 'number' ? lng : parseFloat(String(lng));
        setCoordinates({ lat: latNum, lng: lngNum });
      }
    }
  }, [property]);

  // Handle location select from search
  const handleLocationSelect = useCallback(
    async (location: GeocodingResult) => {
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lon);

      setCoordinates({ lat, lng });

      const address = location.address || {};
      setAddressData({
        address:
          `${address.house_number || ''} ${address.road || ''}`.trim() ||
          location.display_name.split(',')[0] ||
          '',
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        postalCode: address.postcode || '',
        country: address.country_code?.toUpperCase() || 'MX',
      });

      toast.success(t('messages.addressUpdated'));
    },
    [t],
  );

  // Handle marker drag on map
  const handleMarkerDragEnd = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      if (data.address) {
        setAddressData({
          address:
            `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            '',
          state: data.address.state || '',
          postalCode: data.address.postcode || '',
          country: data.address.country_code?.toUpperCase() || 'MX',
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

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          setAddressData({
            address:
              `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              '',
            state: data.address.state || '',
            postalCode: data.address.postcode || '',
            country: data.address.country_code?.toUpperCase() || 'MX',
          });
          toast.success(t('messages.addressUpdated'));
        }
      }
    } catch {
      toast.info(t('messages.positionUpdated'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t('titles.search')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('descriptions.search')}
        </p>
      </div>

      {/* Map Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">
                {t('labels.adjustPosition')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('descriptions.confirm')}
              </p>
            </div>
          </div>

          <LocationSearchBar
            onLocationSelect={handleLocationSelect}
            placeholder={t('labels.searchPlaceholder')}
            defaultValue={addressData.address}
            showCurrentLocationButton={true}
            countryCodes="mx"
          />

          <div className="rounded-lg overflow-hidden border">
            <MapView
              latitude={coordinates?.lat || 15.865}
              longitude={coordinates?.lng || -97.07}
              zoom={coordinates ? 15 : 13}
              className="h-[240px] w-full"
              markerTitle={t('messages.dragMarker')}
              draggableMarker={true}
              showMarker={true}
              onMarkerDragEnd={handleMarkerDragEnd}
              selectionMode={useExactAddress ? 'point' : 'zone'}
              zoneRadiusMeters={FIXED_ZONE_RADIUS}
              onMapClick={handleMapClick}
            />
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-lg font-medium">
                  {useExactAddress
                    ? t('modes.exactAddress')
                    : t('modes.approximateZone')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {useExactAddress
                    ? t('modes.exactAddressDescription')
                    : t('modes.approximateZoneDescription')}
                </p>
              </div>
            </div>
            <Switch
              id="address-mode"
              checked={!useExactAddress}
              onCheckedChange={(checked) => setUseExactAddress(!checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LocationPageClient;
