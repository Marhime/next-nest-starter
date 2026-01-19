'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAddPropertyStore } from '../../store';
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
import {
  ListingTypes,
  PropertyTypeEnum,
  PropertyTypes,
} from '@/features/add-property/schema';
import { ListingType, PropertyType } from '@/hooks/use-create-property';

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
  const locale = useLocale();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);

  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    capacity: property.capacity || 1,
    floor: property.floor || 0,
    area: property.area || undefined,
    constructionYear:
      (property as unknown as { constructionYear?: number })
        ?.constructionYear || undefined,
    landSurface:
      (property as unknown as { landSurface?: number })?.landSurface ||
      undefined,
    amenities: property.amenities || [],
    status: property.status || 'DRAFT',
    price: property.price || '',
    propertyType: property.propertyType,
    listingType: property.listingType,
  });

  const isLand = property.propertyType === 'LAND';
  const isRent = property.listingType === 'RENT';
  const isSale = property.listingType === 'SALE';

  // ✅ Validation correcte: vérifie que price est une string non-vide avec un nombre valide
  const hasValidPrice =
    formData.price && parseFloat(formData.price.toString()) > 0;

  let isValid;
  if (isLand) {
    isValid =
      formData.landSurface !== undefined &&
      formData.landSurface > 0 &&
      hasValidPrice;
  } else {
    isValid = formData.bedrooms > 0 && formData.bathrooms > 0 && hasValidPrice;
  }

  usePropertyForm({
    propertyId: property.id,
    stepIndex: 2,
    isValid: isValid as boolean,
    payload: formData,
    onSuccess: () => {
      router.push(`/${locale}/hosting/${property.id}/description`);
    },
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    setCurrentStep?.(2);
  }, [setCurrentStep]);

  const incrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || 0) + 1,
    }));
  };

  const decrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) - 1),
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities || [];
      const hasAmenity = amenities.includes(amenityId);

      return {
        ...prev,
        amenities: hasAmenity
          ? amenities.filter((a) => a !== amenityId)
          : [...amenities, amenityId],
      };
    });
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
              onValueChange={(key) =>
                setFormData((prev) => ({
                  ...prev,
                  listingType: key as ListingType,
                }))
              }
              defaultValue={property.listingType}
            >
              <SelectTrigger className="w-[180px]">
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
              onValueChange={(key) =>
                setFormData((prev) => ({
                  ...prev,
                  propertyType: key as PropertyType,
                }))
              }
              defaultValue={property.propertyType}
            >
              <SelectTrigger className="w-[180px]">
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
                {formData.listingType === 'SALE'
                  ? t('price.hintSale')
                  : t('price.hintRent')}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-3 relative h-full',
              formData.listingType === 'SALE' ? 'max-w-[11ch]' : 'max-w-[8ch]',
            )}
          >
            <Input
              id="price"
              value={formData.price}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                setFormData((prev) => ({
                  ...prev,
                  price: e.target.value,
                }));
              }}
              className="text-right"
              placeholder={formData.listingType === 'SALE' ? '200000' : '5000'}
            />
            {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold pointer-events-none">
              MXN
            </span> */}
          </div>
        </div>

        {/* Bedrooms */}
        {formData.propertyType !== 'LAND' ? (
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
                  disabled={formData.bedrooms <= 0}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">
                  {formData.bedrooms}
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
                  disabled={formData.bathrooms <= 0}
                  className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">
                  {formData.bathrooms}
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
                'flex items-center gap-3 relative h-full max-w-[11ch]',
              )}
            >
              <Input
                id="price"
                value={formData.landSurface}
                type="text"
                className="text-right"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({
                    ...prev,
                    landSurface: +e.target.value || 0,
                  }));
                }}
                placeholder="250"
              />
            </div>
          </div>
        )}
      </Card>
      {/* Amenities */}
      {formData.propertyType !== 'LAND' && (
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
              const isSelected = formData.amenities?.includes(amenity.id);

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
