'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAddPropertyStore } from '../../store';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Loader2,
  Home,
  Building2,
  LandPlot,
  Hotel,
  Building,
  House,
  BedDouble,
  Calendar,
  CalendarClock,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TypePage = () => {
  const t = useTranslations('PropertyForm');
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

  const PropertyTypeOptions = [
    { value: 'HOUSE', label: t('propertyTypes.house'), icon: Home },
    {
      value: 'APARTMENT',
      label: t('propertyTypes.apartment'),
      icon: Building2,
    },
    { value: 'LAND', label: t('propertyTypes.land'), icon: LandPlot },
  ];

  const ListingTypeOptions = [
    {
      value: 'SHORT_TERM',
      label: t('listingTypes.shortTerm'),
      description: t('listingTypes.shortTermDescription'),
      icon: Calendar,
    },
    {
      // Backend enum uses 'RENT' for long-term rentals — keep frontend value aligned
      value: 'RENT',
      label: t('listingTypes.longTerm'),
      description: t('listingTypes.longTermDescription'),
      icon: CalendarClock,
    },
    {
      value: 'SALE',
      label: t('listingTypes.sale'),
      description: t('listingTypes.saleDescription'),
      icon: DollarSign,
    },
  ];

  console.log('Loaded property in TypePage:', property);

  const [formData, setFormData] = useState<{
    propertyType: string | undefined;
    listingType: string | undefined;
    monthlyPrice: string;
    nightlyPrice: string;
    salePrice: string;
    area?: string;
    bedrooms?: string;
    bathrooms?: string;
    availableFrom?: string;
    furnished?: boolean;
    colocation?: boolean;
    parking?: boolean;
    heatingType?: string;
    constructionYear?: string;
    landSurface?: string;
    amenitiesSelections?: string[];
  }>({
    propertyType: undefined,
    listingType: undefined,
    monthlyPrice: '',
    nightlyPrice: '',
    salePrice: '',
    area: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    availableFrom: undefined,
    furnished: false,
    colocation: false,
    parking: false,
    heatingType: undefined,
    constructionYear: undefined,
    landSurface: undefined,
    amenitiesSelections: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLand = formData.propertyType === 'LAND';

  // used to silence unused var lint during render cycles
  console.log('isSubmitting', isSubmitting);
  console.log('Current formData:', formData);

  useEffect(() => {
    // This page is now a fallback for older flows. The modal handles listing/type selection.
    // Do not modify the property progress here (location is step 0).
    setCurrentStep?.(0);
  }, [setCurrentStep]);

  // Validation du formulaire
  useEffect(() => {
    const isValid =
      formData.propertyType !== undefined &&
      formData.listingType !== undefined &&
      ((formData.listingType === 'RENT' && formData.monthlyPrice !== '') ||
        (formData.listingType === 'SHORT_TERM' &&
          formData.nightlyPrice !== '') ||
        (formData.listingType === 'SALE' && formData.salePrice !== ''));

    setCanProceed?.(isValid);

    // Marking progress for the wizard is done in each step's dedicated page (location/characteristics/...)
    // We intentionally don't mark progress here because this page is a fallback and not part of the new ordered flow.
  }, [formData, setCanProceed, setPropertyProgress, propertyId]);

  // Charger les données existantes
  useEffect(() => {
    if (property) {
      console.log('Loading property data:', {
        propertyType: property.propertyType,
        listingType: property.listingType,
        listingTypeType: typeof property.listingType,
      });

      setFormData({
        propertyType: property.propertyType || undefined,
        listingType: property.listingType || undefined,
        monthlyPrice: property.monthlyPrice
          ? String(property.monthlyPrice)
          : '',
        nightlyPrice: property.nightlyPrice
          ? String(property.nightlyPrice)
          : '',
        salePrice: property.salePrice ? String(property.salePrice) : '',
        area: property.area ? String(property.area) : undefined,
        bedrooms: property.bedrooms ? String(property.bedrooms) : undefined,
        bathrooms: property.bathrooms ? String(property.bathrooms) : undefined,
        availableFrom: (property as unknown as { availableFrom?: string })
          ?.availableFrom
          ? new Date(
              (
                property as unknown as { availableFrom?: string }
              ).availableFrom!,
            )
              .toISOString()
              .slice(0, 10)
          : undefined,
        furnished:
          (
            property as unknown as { amenities?: string[] }
          )?.amenities?.includes('furnished') || false,
        colocation:
          (
            property as unknown as { amenities?: string[] }
          )?.amenities?.includes('colocation') || false,
        parking:
          (
            property as unknown as { amenities?: string[] }
          )?.amenities?.includes('parking') || false,
        heatingType: (() => {
          const found = (
            property as unknown as { amenities?: string[] }
          )?.amenities?.find((a: string) => a?.startsWith?.('heating:'));
          return found ? String(found).split(':')[1] : undefined;
        })(),
        constructionYear: (() => {
          const found = (
            property as unknown as { amenities?: string[] }
          )?.amenities?.find((a: string) =>
            a?.startsWith?.('constructionYear:'),
          );
          return found ? String(found).split(':')[1] : undefined;
        })(),
        landSurface: (property as unknown as { landSurface?: number })
          ?.landSurface
          ? String(
              (property as unknown as { landSurface?: number })?.landSurface,
            )
          : undefined,
        amenitiesSelections:
          (property as unknown as { amenities?: string[] })?.amenities || [],
      });

      // If property already has type and listing (modal already set them), skip to location
      if (property.propertyType && property.listingType) {
        // ensure we redirect to the location step
        router.push(`/hosting/${propertyId}/location`);
        return;
      }
    }
  }, [property, propertyId, router]);

  // Réinitialiser les prix non pertinents quand le ListingType change (mais pas au chargement initial)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (property && !initialLoadDone) {
      setInitialLoadDone(true);
      return;
    }

    if (!initialLoadDone) return;

    if (formData.listingType === 'RENT') {
      // Garder seulement monthlyPrice
      setFormData((prev) => ({
        ...prev,
        nightlyPrice: '',
        salePrice: '',
      }));
    } else if (formData.listingType === 'SHORT_TERM') {
      // Garder seulement nightlyPrice
      setFormData((prev) => ({
        ...prev,
        monthlyPrice: '',
        salePrice: '',
      }));
    } else if (formData.listingType === 'SALE') {
      // Garder seulement salePrice
      setFormData((prev) => ({
        ...prev,
        monthlyPrice: '',
        nightlyPrice: '',
      }));
    }
  }, [formData.listingType, initialLoadDone, property]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation: PropertyType obligatoire
      if (!formData.propertyType) {
        toast.error(t('messages.selectPropertyType'));
        return;
      }

      // Validation conditionnelle des prix selon le ListingType
      if (formData.listingType === 'RENT' && !formData.monthlyPrice) {
        toast.error(t('messages.monthlyPriceRequired'));
        return;
      }

      if (formData.listingType === 'SHORT_TERM' && !formData.nightlyPrice) {
        toast.error(t('messages.nightlyPriceRequired'));
        return;
      }

      if (formData.listingType === 'SALE' && !formData.salePrice) {
        toast.error(t('messages.salePriceRequired'));
        return;
      }

      // Si pas de ListingType, au moins un prix doit être défini
      if (
        !formData.listingType &&
        !formData.monthlyPrice &&
        !formData.nightlyPrice &&
        !formData.salePrice
      ) {
        toast.error(t('messages.setPriceAtLeast'));
        return;
      }

      console.log(formData.listingType);

      setIsSubmitting(true);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // Build amenities array: keep user selections and encode some structured fields
        const amenities: string[] = Array.isArray(formData.amenitiesSelections)
          ? [...formData.amenitiesSelections]
          : [];

        if (formData.furnished) amenities.push('furnished');
        if (formData.colocation) amenities.push('colocation');
        if (formData.parking) amenities.push('parking');
        if (formData.heatingType)
          amenities.push(`heating:${formData.heatingType}`);
        if (formData.constructionYear)
          amenities.push(`constructionYear:${formData.constructionYear}`);

        const updatePromise = fetch(`${API_URL}/properties/${propertyId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyType: formData.propertyType,
            listingType: formData.listingType,
            monthlyPrice: formData.monthlyPrice
              ? parseFloat(formData.monthlyPrice)
              : null,
            nightlyPrice: formData.nightlyPrice
              ? parseFloat(formData.nightlyPrice)
              : null,
            salePrice: formData.salePrice
              ? parseFloat(formData.salePrice)
              : null,
            // For LAND properties we persist landSurface in its dedicated column
            // and set area to null to avoid confusion.
            area:
              formData.propertyType === 'LAND'
                ? null
                : formData.area
                  ? parseFloat(formData.area)
                  : null,
            bedrooms: formData.bedrooms
              ? parseInt(formData.bedrooms, 10)
              : null,
            bathrooms: formData.bathrooms
              ? parseInt(formData.bathrooms, 10)
              : null,
            landSurface:
              formData.propertyType === 'LAND' && formData.landSurface
                ? parseFloat(formData.landSurface)
                : null,
            availableFrom: formData.availableFrom || null,
            amenities,
            currency: 'MXN',
          }),
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update property');
          }
          return response.json();
        });

        await toast.promise(updatePromise, {
          loading: t('messages.updating') || 'Mise à jour...',
          success: t('messages.updateSuccess'),
          error: (err) => err.message || t('messages.updateError'),
        });

        mutate(); // Rafraîchir les données

        // Rediriger vers la prochaine étape
        router.push(`/hosting/${propertyId}/location`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, propertyId, router, mutate, t],
  );

  // Configurer le handler pour le bouton Next
  useEffect(() => {
    const handler = async () => {
      console.log('Type page handleNext called');
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      await handleSubmit(syntheticEvent);
    };

    console.log('Type page: Setting handleNext');
    setHandleNext?.(handler);

    return () => {
      console.log('Type page: Clearing handleNext');
      setHandleNext?.(undefined);
    };
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
      <div className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t('labels.propertyType')} et tarification</CardTitle>
          <CardDescription>{t('labels.pricingDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type */}
            <div className="space-y-3">
              <Label>
                {t('labels.propertyType')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {PropertyTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.propertyType === option.value;
                  return (
                    <Card
                      key={option.value}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                        isSelected && 'border-primary ring-2 ring-primary',
                      )}
                      onClick={() => {
                        console.log('PropertyType changed to:', option.value);
                        setFormData({
                          ...formData,
                          propertyType: option.value,
                        });
                      }}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted',
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">{option.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Listing Type */}
            <div className="space-y-3">
              <Label>
                {t('labels.listingType')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ListingTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.listingType === option.value;
                  return (
                    <Card
                      key={option.value}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                        isSelected && 'border-primary ring-2 ring-primary',
                      )}
                      onClick={() => {
                        console.log('ListingType changed to:', option.value);
                        setFormData({ ...formData, listingType: option.value });
                      }}
                    >
                      <CardContent className="p-4 flex items-start space-x-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted',
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {formData.listingType && (
                <p className="text-sm text-muted-foreground">
                  {formData.listingType === 'RENT' &&
                    t('messages.monthlyPriceInfo')}
                  {formData.listingType === 'SHORT_TERM' &&
                    t('messages.nightlyPriceInfo')}
                  {formData.listingType === 'SALE' &&
                    t('messages.salePriceInfo')}
                </p>
              )}
            </div>

            {/* Prices - Affichage conditionnel */}
            {formData.listingType && (
              <div className="space-y-4">
                <Label>
                  {t('labels.pricing')}{' '}
                  {formData.listingType && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                {/* Monthly Price - Affiché si RENT (long-term) ou pas de choix */}
                {formData.listingType === 'RENT' && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="monthlyPrice"
                      className="text-sm font-normal"
                    >
                      {t('labels.monthlyPrice')}
                      {formData.listingType === 'RENT' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="monthlyPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.monthlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyPrice: e.target.value,
                          })
                        }
                        required={formData.listingType === 'RENT'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        MXN {t('labels.perMonth')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Nightly Price - Affiché si SHORT_TERM ou pas de choix */}
                {formData.listingType === 'SHORT_TERM' && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="nightlyPrice"
                      className="text-sm font-normal"
                    >
                      {t('labels.nightlyPrice')}
                      {formData.listingType === 'SHORT_TERM' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="nightlyPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.nightlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nightlyPrice: e.target.value,
                          })
                        }
                        required={formData.listingType === 'SHORT_TERM'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        MXN {t('labels.perNight')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sale Price - Affiché si SALE ou pas de choix */}
                {formData.listingType === 'SALE' && (
                  <div className="space-y-2">
                    <Label htmlFor="salePrice" className="text-sm font-normal">
                      {t('labels.salePrice')}
                      {formData.listingType === 'SALE' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.salePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salePrice: e.target.value,
                          })
                        }
                        required={formData.listingType === 'SALE'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        MXN
                      </span>
                    </div>
                  </div>
                )}

                {/* Informations clés (surface, pièces, salles d'eau, disponibilité, meublé, colocation) */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">
                    Informations clés
                  </Label>

                  {isLand ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="landSurface" className="text-sm">
                          Surface du terrain (m²)
                        </Label>
                        <Input
                          id="landSurface"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ex: 250"
                          value={formData.landSurface || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              landSurface: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="area" className="text-sm">
                          Superficie (m²)
                        </Label>
                        <Input
                          id="area"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ex: 75"
                          value={formData.area || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="bedrooms" className="text-sm">
                          Nombre de pièces
                        </Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          placeholder="Ex: 3"
                          value={formData.bedrooms || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bedrooms: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="bathrooms" className="text-sm">
                          Nombre de salles de bain
                        </Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          placeholder="Ex: 1"
                          value={formData.bathrooms || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bathrooms: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="availableFrom" className="text-sm">
                        Disponible à partir de
                      </Label>
                      <Input
                        id="availableFrom"
                        type="date"
                        value={formData.availableFrom || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availableFrom: e.target.value,
                          })
                        }
                      />
                    </div>

                    {!isLand && (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={!!formData.furnished}
                          onCheckedChange={(val) =>
                            setFormData({ ...formData, furnished: !!val })
                          }
                        />
                        <Label>Meublé</Label>
                      </div>
                    )}

                    {!isLand && (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={!!formData.colocation}
                          onCheckedChange={(val) =>
                            setFormData({ ...formData, colocation: !!val })
                          }
                        />
                        <Label>Colocation possible</Label>
                      </div>
                    )}
                  </div>

                  {/* Equipements et espaces extérieurs */}
                  <div className="space-y-2">
                    <Label className="text-sm">Équipements (optionnel)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        ['kitchen_equipped', 'Cuisine équipée'],
                        ['terrace', 'Terrasse'],
                        ['balcony', 'Balcon'],
                        ['garden', 'Jardin'],
                        ['pool', 'Piscine'],
                      ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.amenitiesSelections?.includes(
                              String(key),
                            )}
                            onCheckedChange={(checked) => {
                              const set = new Set(
                                formData.amenitiesSelections || [],
                              );
                              if (checked) set.add(String(key));
                              else set.delete(String(key));
                              setFormData({
                                ...formData,
                                amenitiesSelections: Array.from(set),
                              });
                            }}
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="parking" className="text-sm">
                        Stationnement
                      </Label>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={!!formData.parking}
                          onCheckedChange={(val) =>
                            setFormData({ ...formData, parking: !!val })
                          }
                        />
                        <Label>Oui</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="heatingType" className="text-sm">
                        Type de chauffage
                      </Label>
                      <Select
                        value={formData.heatingType}
                        onValueChange={(val) =>
                          setFormData({ ...formData, heatingType: val })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Electrique',
                            'Gaz',
                            'Collectif',
                            'Pompe à chaleur',
                          ].map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="constructionYear" className="text-sm">
                        Année de construction
                      </Label>
                      <Input
                        id="constructionYear"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="Ex: 2005"
                        value={formData.constructionYear || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            constructionYear: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default TypePage;
