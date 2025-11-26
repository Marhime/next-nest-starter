'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAddPropertyStore } from '../../store';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
    { value: 'HOTEL', label: t('propertyTypes.hotel'), icon: Hotel },
    { value: 'HOSTEL', label: t('propertyTypes.hostel'), icon: Building },
    { value: 'GUESTHOUSE', label: t('propertyTypes.guesthouse'), icon: House },
    { value: 'ROOM', label: t('propertyTypes.room'), icon: BedDouble },
  ];

  const ListingTypeOptions = [
    {
      value: 'SHORT_TERM',
      label: t('listingTypes.shortTerm'),
      description: t('listingTypes.shortTermDescription'),
      icon: Calendar,
    },
    {
      value: 'LONG_TERM',
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
  }>({
    propertyType: undefined,
    listingType: undefined,
    monthlyPrice: '',
    nightlyPrice: '',
    salePrice: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Current formData:', formData);

  useEffect(() => {
    setCurrentStep?.(0); // Type is now step 0 (was step 1)
  }, [setCurrentStep]);

  // Validation du formulaire
  useEffect(() => {
    const isValid =
      formData.propertyType !== undefined &&
      formData.listingType !== undefined &&
      ((formData.listingType === 'LONG_TERM' && formData.monthlyPrice !== '') ||
        (formData.listingType === 'SHORT_TERM' &&
          formData.nightlyPrice !== '') ||
        (formData.listingType === 'SALE' && formData.salePrice !== ''));

    setCanProceed?.(isValid);

    // Mark step as completed when valid
    if (isValid && propertyId) {
      setPropertyProgress(Number(propertyId), 0, true);
    }
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
      });
    }
  }, [property]);

  // Réinitialiser les prix non pertinents quand le ListingType change (mais pas au chargement initial)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (property && !initialLoadDone) {
      setInitialLoadDone(true);
      return;
    }

    if (!initialLoadDone) return;

    if (formData.listingType === 'LONG_TERM') {
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
      if (formData.listingType === 'LONG_TERM' && !formData.monthlyPrice) {
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
                  {formData.listingType === 'LONG_TERM' &&
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
                {/* Monthly Price - Affiché si LONG_TERM ou pas de choix */}
                {formData.listingType === 'LONG_TERM' && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="monthlyPrice"
                      className="text-sm font-normal"
                    >
                      {t('labels.monthlyPrice')}
                      {formData.listingType === 'LONG_TERM' && (
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
                        required={formData.listingType === 'LONG_TERM'}
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
              </div>
            )}
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default TypePage;
