'use client';
import React, { useEffect, useState } from 'react';
import { useAddPropertyStore } from '../../store';
import { useParams, useRouter } from 'next/navigation';
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
    setCurrentStep?.(2);
  }, [setCurrentStep]);

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
        country: extendedProperty.country || 'FR',
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

  const handleFormConfirm = () => {
    // Validation du formulaire
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

    // Vérifier que les coordonnées sont valides
    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      toast.error(t('messages.invalidCoordinates'));
      setCurrentPhase('search');
      return;
    }

    // Passer à la phase de confirmation avec carte
    setCurrentPhase('confirm');
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    toast.info(t('messages.positionUpdated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }

      toast.success(t('messages.addressSaved'));
      mutate(); // Refresh data

      // Navigate to next step
      router.push(`/hosting/${propertyId}/photos`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('messages.updateError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full justify-center items-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
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
        <CardContent>
          {/* PHASE 1: Search */}
          {currentPhase === 'search' && (
            <div className="space-y-6">
              <LocationSearchInput
                onLocationSelect={handleLocationSelect}
                defaultValue={
                  property?.address
                    ? `${property.address}, ${property.city || ''}`
                    : ''
                }
              />

              {/* Carte - affiche toujours Puerto Escondido par défaut ou les coordonnées si elles existent */}
              <div className="rounded-lg overflow-hidden border">
                <MapView
                  latitude={coordinates?.lat || 15.865}
                  longitude={coordinates?.lng || -97.0681}
                  zoom={coordinates ? 15 : 12}
                  className="h-[400px] w-full"
                  markerTitle={
                    coordinates
                      ? 'Emplacement sélectionné'
                      : 'Puerto Escondido, Oaxaca'
                  }
                  showMarker={!!coordinates}
                />
              </div>

              {!coordinates && (
                <p className="text-sm text-muted-foreground text-center">
                  📍 Recherchez votre adresse pour positionner votre bien sur la
                  carte
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/hosting/${propertyId}/type`)}
                  className="flex-1"
                >
                  {t('buttons.back')}
                </Button>
              </div>
            </div>
          )}

          {/* PHASE 2: Form */}
          {currentPhase === 'form' && (
            <div className="space-y-6">
              <AddressConfirmForm
                formData={addressForm}
                onChange={handleFormChange}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPhase('search')}
                  className="flex-1"
                >
                  {t('buttons.back')}
                </Button>
                <Button
                  type="button"
                  onClick={handleFormConfirm}
                  disabled={
                    !addressForm.street ||
                    !addressForm.postalCode ||
                    !addressForm.city ||
                    !coordinates
                  }
                  className="flex-1"
                >
                  {t('buttons.continue')}
                </Button>
              </div>
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
                        Aucune position définie
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Veuillez rechercher et sélectionner une adresse pour
                        positionner votre bien sur la carte.
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
                        markerTitle="Déplacez-moi pour ajuster la position"
                        draggableMarker={true}
                        onMarkerDragEnd={handleMarkerDragEnd}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Vous pouvez déplacer le marqueur pour positionner
                      précisément votre bien
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentPhase('form')}
                        className="flex-1"
                      >
                        {t('buttons.modifyAddress')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('messages.validating')}
                          </>
                        ) : (
                          t('buttons.validateAndContinue')
                        )}
                      </Button>
                    </div>
                  </form>
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
