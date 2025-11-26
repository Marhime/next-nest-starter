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
import {
  LocationSearchInput,
  type LocationResult,
} from '@/components/location/LocationSearchInput';
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

  // Workflow steps: 'search' -> 'form' -> 'confirm'
  const [currentPhase, setCurrentPhase] = useState<
    'search' | 'form' | 'confirm'
  >('search');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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

  useEffect(() => {
    setCurrentStep?.(1);
  }, [setCurrentStep]);

  // Validation: activer Next seulement si on a les données nécessaires pour chaque phase
  useEffect(() => {
    let isValid = false;

    if (currentPhase === 'search') {
      // En phase search, on peut avancer si on a des coordonnées
      isValid = coordinates !== null;
    } else if (currentPhase === 'form') {
      // En phase form, on peut avancer si tous les champs sont remplis
      isValid = !!(
        addressForm.street &&
        addressForm.postalCode &&
        addressForm.city &&
        coordinates
      );
    } else if (currentPhase === 'confirm') {
      // En phase confirm, on peut soumettre
      isValid = coordinates !== null;
    }

    console.log('Location validation:', {
      currentPhase,
      coordinates,
      isValid,
      addressForm,
    });

    setCanProceed?.(isValid);

    // Mark step as complete when address is validated (confirm phase with valid data)
    if (currentPhase === 'confirm' && isValid && propertyId) {
      setPropertyProgress?.(Number(propertyId), 1, true);
    }
  }, [
    currentPhase,
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

        // Si on a déjà des coordonnées ET une adresse complète, passer directement à la phase confirm
        if (hasExistingData) {
          setCurrentPhase('confirm');
        }
      }
    }
  }, [property]);

  const handleLocationSelect = (location: LocationResult) => {
    setCoordinates({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
    });

    // Pre-fill form with location data
    setAddressForm({
      street:
        `${location.address.house_number || ''} ${location.address.road || ''}`.trim(),
      buildingInfo: '',
      buildingName: '',
      postalCode: location.address.postcode || '',
      city:
        location.address.city ||
        location.address.town ||
        location.address.village ||
        '',
      state: location.address.state || '',
      country: location.address.country_code?.toUpperCase() || 'FR',
    });

    // Passer à la phase formulaire
    setCurrentPhase('form');
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

      // Validation
      if (!addressForm.street) {
        toast.error(t('messages.addressRequired'));
        return;
      }

      if (!addressForm.postalCode) {
        toast.error(t('messages.postalCodeRequired'));
        return;
      }

      if (!addressForm.city) {
        toast.error(t('messages.cityRequired'));
        return;
      }

      if (!coordinates) {
        toast.error(t('messages.selectAddress'));
        return;
      }

      setIsSubmitting(true);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const payload = {
          address: addressForm.street,
          city: addressForm.city,
          state: addressForm.state || null,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
          latitude: Number(coordinates.lat),
          longitude: Number(coordinates.lng),
        };

        console.log('Sending location data:', payload);

        const updatePromise = fetch(`${API_URL}/properties/${propertyId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update property');
          }
          return response.json();
        });

        await toast.promise(updatePromise, {
          loading: t('messages.saving') || 'Sauvegarde...',
          success: t('messages.addressSaved'),
          error: (err) => err.message || t('messages.updateError'),
        });

        mutate(); // Refresh data

        // Navigate to next step
        router.push(`/hosting/${propertyId}/photos`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [addressForm, coordinates, propertyId, router, mutate, t],
  );

  // Configurer le handler pour le bouton Next
  useEffect(() => {
    const handler = async () => {
      console.log('Location page handleNext called, phase:', currentPhase);

      if (currentPhase === 'search') {
        // Passer à la phase formulaire
        console.log('Moving from search to form');
        setCurrentPhase('form');
      } else if (currentPhase === 'form') {
        // Valider et passer à confirm
        console.log('Validating form and moving to confirm');
        if (!addressForm.street) {
          toast.error(t('messages.addressRequired'));
          return;
        }
        if (!addressForm.postalCode) {
          toast.error(t('messages.postalCodeRequired'));
          return;
        }
        if (!addressForm.city) {
          toast.error(t('messages.cityRequired'));
          return;
        }
        if (!coordinates) {
          toast.error(t('messages.selectAddress'));
          return;
        }
        if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
          toast.error(t('messages.invalidCoordinates'));
          setCurrentPhase('search');
          return;
        }
        setCurrentPhase('confirm');
      } else if (currentPhase === 'confirm') {
        // Soumettre le formulaire
        console.log('Submitting location data');
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent;
        await handleSubmit(syntheticEvent);
      }
    };

    console.log('Location page: Setting handleNext for phase:', currentPhase);
    setHandleNext?.(handler);

    return () => {
      console.log('Location page: Clearing handleNext');
      setHandleNext?.(undefined);
    };
  }, [setHandleNext, handleSubmit, currentPhase, addressForm, coordinates, t]);

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
          <CardTitle className="text-4xl">
            {currentPhase === 'search' && t('titles.search')}
            {currentPhase === 'form' && t('titles.form')}
            {currentPhase === 'confirm' && t('titles.confirm')}
          </CardTitle>
          <CardDescription>
            {currentPhase === 'search' && t('descriptions.search')}
            {currentPhase === 'form' && t('descriptions.form')}
            {currentPhase === 'confirm' && t('descriptions.confirm')}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {/* PHASE 1: Search */}
          {currentPhase === 'search' && (
            <div className="space-y-6">
              <LocationSearchInput
                onLocationSelect={handleLocationSelect}
                className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[calc(100%-5rem)] shadow-md rounded-xl z-10 bg-white p-5"
                defaultValue={
                  property?.address
                    ? `${property.address}, ${property.city || ''}`
                    : ''
                }
              />

              {/* Carte - affiche toujours Puerto Escondido par défaut ou les coordonnées si elles existent */}
              <div className="rounded-lg overflow-hidden border">
                <MapView
                  latitude={coordinates?.lat || 15.5143}
                  longitude={coordinates?.lng || 97.0418}
                  zoom={coordinates ? 15 : 12}
                  className="h-[900px] w-full"
                  markerTitle={
                    coordinates
                      ? t('messages.selectedLocation')
                      : t('messages.defaultLocation')
                  }
                  showMarker={!!coordinates}
                />
              </div>

              {!coordinates && (
                <p className="text-sm text-muted-foreground text-center">
                  📍 {t('messages.clickToSelect')}
                </p>
              )}
            </div>
          )}

          {/* PHASE 2: Form */}
          {currentPhase === 'form' && (
            <div className="space-y-6">
              <AddressConfirmForm
                formData={addressForm}
                onChange={handleFormChange}
              />
            </div>
          )}

          {/* PHASE 3: Confirm on Map */}
          {currentPhase === 'confirm' && (
            <>
              {!coordinates ? (
                // Pas de coordonnées - afficher message et bouton pour revenir à la recherche
                <div className="space-y-6">
                  <div className="p-6 bg-muted rounded-lg text-center space-y-4">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold mb-2">
                        {t('messages.selectAddress')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('descriptions.search')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentPhase('form')}
                      className="flex-1"
                    >
                      {t('buttons.back')}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentPhase('search')}
                      className="flex-1"
                    >
                      {t('buttons.changeAddress')}
                    </Button>
                  </div>
                </div>
              ) : (
                // Avec coordonnées - afficher la carte
                <div className="space-y-6">
                  {/* Adresse affichée */}
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{addressForm.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {addressForm.postalCode} {addressForm.city}
                          {addressForm.state && `, ${addressForm.state}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addressForm.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Carte interactive avec marqueur déplaçable */}
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border">
                      <MapView
                        latitude={coordinates.lat}
                        longitude={coordinates.lng}
                        zoom={17}
                        className="h-[500px] w-full"
                        markerTitle={t('messages.dragMarker')}
                        draggableMarker={true}
                        onMarkerDragEnd={handleMarkerDragEnd}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {t('messages.mapInstructions')}
                    </p>
                  </div>

                  {/* Bouton pour modifier l'adresse */}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentPhase('search')}
                      disabled={isSubmitting}
                    >
                      {t('buttons.modifyAddress')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPage;
