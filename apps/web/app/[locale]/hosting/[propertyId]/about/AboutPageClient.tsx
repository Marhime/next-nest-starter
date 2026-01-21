'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePropertyForm } from '@/hooks/use-property-form';
import {
  Bed,
  Bath,
  Building2,
  Wifi,
  Car,
  Waves,
  Snowflake,
  Tv,
  UtensilsCrossed,
  Minus,
  Plus,
  CheckCircle2,
  Heater,
  Wind,
  Fence,
  Dog,
  Trees,
  Sofa,
  Dumbbell,
  Shield,
  Shirt,
  DoorOpen,
  Sparkles,
  Sun,
  Refrigerator,
  CircleDollarSign,
  LandPlot,
  MapPinHouse,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListingTypes, PropertyTypes } from '@/features/add-property/schema';
import { ListingType, PropertyType } from '@/hooks/use-create-property';
import { STEP_ABOUT, useStepValidation } from '@/hooks/use-step-validation';

export interface AboutProperty {
  id: number;
  title: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  floor?: number;
  area?: number;
  amenities?: string[];
  status: string;
  propertyType: PropertyType;
  listingType?: ListingType;
  price: number;
  photos?: Array<{ id: number }>; // Add photos for validation
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface AboutPageClientProps {
  property: AboutProperty;
}

// Liste des équipements disponibles (labels are translation keys)
const AVAILABLE_AMENITIES = [
  { id: 'wifi', labelKey: 'amenities.wifi', icon: Wifi },
  {
    id: 'air_conditioning',
    labelKey: 'amenities.air_conditioning',
    icon: Snowflake,
  },
  { id: 'heating', labelKey: 'amenities.heating', icon: Heater },
  { id: 'kitchen', labelKey: 'amenities.kitchen', icon: UtensilsCrossed },

  { id: 'tv', labelKey: 'amenities.tv', icon: Tv },
  {
    id: 'refrigerator',
    labelKey: 'amenities.refrigerator',
    icon: Refrigerator,
  },
  { id: 'washing_machine', labelKey: 'amenities.washing_machine', icon: Shirt },

  { id: 'parking', labelKey: 'amenities.parking', icon: Car },
  { id: 'garage', labelKey: 'amenities.garage', icon: DoorOpen },
  { id: 'garden', labelKey: 'amenities.garden', icon: Trees },
  { id: 'balcony', labelKey: 'amenities.balcony', icon: Sun },
  { id: 'terrace', labelKey: 'amenities.terrace', icon: Fence },

  { id: 'pool', labelKey: 'amenities.pool', icon: Waves },
  { id: 'gym', labelKey: 'amenities.gym', icon: Dumbbell },
  { id: 'jacuzzi', labelKey: 'amenities.jacuzzi', icon: Waves },

  { id: 'security', labelKey: 'amenities.security', icon: Shield },
  { id: 'doorman', labelKey: 'amenities.doorman', icon: Shield },
  { id: 'elevator', labelKey: 'amenities.elevator', icon: Building2 },
  { id: 'furnished', labelKey: 'amenities.furnished', icon: Sofa },

  { id: 'pets_allowed', labelKey: 'amenities.pets_allowed', icon: Dog },
  {
    id: 'cleaning_service',
    labelKey: 'amenities.cleaning_service',
    icon: Sparkles,
  },
  { id: 'ventilator', labelKey: 'amenities.ventilator', icon: Wind },
];

export function AboutPageClient({ property }: AboutPageClientProps) {
  const t = useTranslations('AboutPage');
  const tGen = useTranslations('Generic');
  const router = useRouter();

  // ✅ Separate primitive values from arrays for better memoization
  const [listingType, setListingType] = useState<ListingType | undefined>(
    property.listingType,
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    property.propertyType,
  );
  const [bedrooms, setBedrooms] = useState(property.bedrooms || 0);
  const [bathrooms, setBathrooms] = useState(property.bathrooms || 0);
  const [capacity, setCapacity] = useState(property.capacity || 1);
  const [floor, setFloor] = useState(property.floor || 0);
  const [landSurface, setLandSurface] = useState(
    (property as unknown as { landSurface?: number })?.landSurface || undefined,
  );
  const [price, setPrice] = useState(property.price || '');
  const [amenities, setAmenities] = useState<string[]>(
    property.amenities || [],
  );

  // ✅ Stabilize amenities array reference for memoization
  const amenitiesKey = useMemo(() => amenities.sort().join(','), [amenities]);

  const isLand = propertyType === 'LAND';

  // ✅ Validation correcte: vérifie que price est une string non-vide avec un nombre valide
  const hasValidPrice = price && parseFloat(price.toString()) > 0;

  const isValid = useMemo(() => {
    if (isLand) {
      return !!(landSurface !== undefined && landSurface > 0 && hasValidPrice);
    }
    return !!(bedrooms > 0 && bathrooms > 0 && hasValidPrice);
  }, [isLand, landSurface, bedrooms, bathrooms, hasValidPrice]);

  // ✅ Memoize payload with proper dependencies
  // ⚠️ Include listingType and propertyType for Characteristics step
  const payload = useMemo(
    () => ({
      listingType,
      propertyType,
      bedrooms,
      bathrooms,
      capacity,
      floor,
      landSurface,
      amenities, // Use the actual array, not amenitiesKey
      price,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      listingType,
      propertyType,
      bedrooms,
      bathrooms,
      capacity,
      floor,
      landSurface,
      price,
      amenitiesKey, // ✅ Use string key for array stability
    ],
  );

  // ✅ Memoize success callback with stable propertyId
  const propertyId = property.id;
  const handleSuccess = useCallback(() => {
    router.push(`/hosting/${propertyId}/description`);
  }, [router, propertyId]);

  usePropertyForm({
    propertyId,
    stepIndex: 2,
    isValid,
    payload,
    onSuccess: handleSuccess,
  });

  // Validate step access
  useStepValidation(STEP_ABOUT, property, false);

  const incrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    if (field === 'bedrooms') setBedrooms((prev) => prev + 1);
    else if (field === 'bathrooms') setBathrooms((prev) => prev + 1);
    else if (field === 'capacity') setCapacity((prev) => prev + 1);
    else if (field === 'floor') setFloor((prev) => prev + 1);
  };

  const decrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    if (field === 'bedrooms') setBedrooms((prev) => Math.max(0, prev - 1));
    else if (field === 'bathrooms')
      setBathrooms((prev) => Math.max(0, prev - 1));
    else if (field === 'capacity') setCapacity((prev) => Math.max(0, prev - 1));
    else if (field === 'floor') setFloor((prev) => Math.max(0, prev - 1));
  };

  const toggleAmenity = (amenityId: string) => {
    setAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId],
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t('header.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('header.subtitle')}</p>
      </div>

      {/* Title & Description moved to the dedicated Description step */}
      <Card className="p-6">
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPinHouse className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">{t('listingType.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('listingType.hint')}
              </p>
            </div>
          </div>
          <div className={cn('flex items-center gap-3 relative h-full')}>
            <Select
              value={listingType}
              onValueChange={(value) => setListingType(value as ListingType)}
            >
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {ListingTypes.map((key) => (
                  <SelectItem className="capitalize" key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">{t('propertyType.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('propertyType.hint')}
              </p>
            </div>
          </div>
          <div
            className={cn('flex items-center gap-3 relative h-full text-right')}
          >
            <Select
              value={propertyType}
              onValueChange={(value) => setPropertyType(value as PropertyType)}
            >
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue className="text-right" placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {PropertyTypes.map((key) => (
                  <SelectItem className="capitalize" key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CircleDollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">{t('price.title')}</p>
              <p className="text-sm text-muted-foreground">
                {listingType === 'SALE'
                  ? t('price.hintSale')
                  : t('price.hintRent')}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-3 relative h-full',
              listingType === 'SALE' ? 'w-[180px]' : 'w-[140px]',
            )}
          >
            <Input
              id="price"
              value={price}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                setPrice(e.target.value);
              }}
              className="text-right h-12 pr-14"
              placeholder={listingType === 'SALE' ? '200000' : '5000'}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
              MXN
            </span>
          </div>
        </div>

        {/* Bedrooms */}
        {propertyType !== 'LAND' ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bed className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">{t('bedrooms.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('bedrooms.hint')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementValue('bedrooms')}
                  disabled={bedrooms <= 0}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">
                  {bedrooms}
                </span>
                <button
                  onClick={() => incrementValue('bedrooms')}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bath className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">{t('bathrooms.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('bathrooms.hint')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementValue('bathrooms')}
                  disabled={bathrooms <= 0}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">
                  {bathrooms}
                </span>
                <button
                  onClick={() => incrementValue('bathrooms')}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <LandPlot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">{t('landSurface.label')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('landSurface.placeholder')}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'flex items-center gap-3 relative h-full w-[140px]',
              )}
            >
              <Input
                id="landSurface"
                value={landSurface || ''}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="text-right h-12 pr-12"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  setLandSurface(+e.target.value || undefined);
                }}
                placeholder="250"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                m²
              </span>
            </div>
          </div>
        )}
      </Card>
      {/* Amenities */}
      {property.propertyType !== 'LAND' && (
        <Card className="p-6">
          <CardHeader className="p-0">
            <h2 className="text-xl font-semibold">
              {t('amenities.title')} ({tGen('optional')})
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('amenities.hint')}
            </p>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = amenities.includes(amenity.id);

              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-600'}`}
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t(amenity.labelKey)}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Status */}
    </div>
  );
}
