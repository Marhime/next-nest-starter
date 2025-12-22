'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCreateProperty } from '@/hooks/use-create-property';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, Building2, LandPlot, KeyRound, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND';

interface PropertyTypeOption {
  type: PropertyType;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function PropertyTypeModal() {
  const isOpen = useGlobalStore((state) => state.isPropertyTypeModalOpen);
  const setIsOpen = useGlobalStore((state) => state.setIsPropertyTypeModalOpen);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const t = useTranslations('PropertyTypeModal');

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <PropertyTypeSelection />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DrawerDescription>{t('description')}</DrawerDescription>
        </DrawerHeader>
        <PropertyTypeSelection className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function PropertyTypeSelection({ className }: { className?: string }) {
  // Step 1: choose listing (SALE or RENT) — keep value aligned with backend ('RENT')
  const [listingChoice, setListingChoice] = React.useState<
    'SALE' | 'RENT' | null
  >(null);
  // Step 2: choose property type
  const [selectedType, setSelectedType] = React.useState<PropertyType | null>(
    null,
  );

  const { createProperty, isCreating } = useCreateProperty();
  const setIsOpen = useGlobalStore((state) => state.setIsPropertyTypeModalOpen);
  const router = useRouter();
  const t = useTranslations('PropertyTypeModal');

  const propertyTypes: PropertyTypeOption[] = [
    {
      type: 'HOUSE',
      labelKey: 'house.label',
      descriptionKey: 'house.description',
      icon: Home,
    },
    {
      type: 'APARTMENT',
      labelKey: 'apartment.label',
      descriptionKey: 'apartment.description',
      icon: Building2,
    },
    {
      type: 'LAND',
      labelKey: 'land.label',
      descriptionKey: 'land.description',
      icon: LandPlot,
    },
  ];

  const handleSelectAndCreate = async (type: PropertyType) => {
    setSelectedType(type);

    try {
      const property = await createProperty({
        propertyType: type,
        listingType: listingChoice || undefined,
      });

      toast.success(t('successMessage'));

      // Close modal
      setIsOpen?.(false);

      // Redirect to the hosting flow
      router.push(`/hosting/${property.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errorMessage'));
      setSelectedType(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {listingChoice
            ? t('choosePropertyTypeTitle')
            : t('chooseListingTitle')}
        </DialogTitle>
      </DialogHeader>
      <div className={cn('grid gap-4 pt-4', className)}>
        {/* Step: Listing choice */}
        {!listingChoice && (
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                className="p-4 rounded-lg border-2 hover:border-primary flex flex-col items-center gap-4"
                onClick={() => setListingChoice('SALE')}
              >
                <DollarSign size={48} />
                <div className="font-medium">{t('listing.sale')}</div>
              </button>

              <button
                className="p-4 rounded-lg border-2 hover:border-primary flex flex-col items-center gap-4"
                onClick={() => setListingChoice('RENT')}
              >
                <KeyRound size={48} />
                <div className="font-medium">{t('listing.rent')}</div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Property type selection (shown after listing choice) */}
        {listingChoice && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <button
                  className="text-sm text-muted-foreground underline"
                  onClick={() => setListingChoice(null)}
                >
                  {t('back')}
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {propertyTypes.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;
                const isDisabled = isCreating && !isSelected;

                return (
                  <button
                    key={option.type}
                    onClick={() => handleSelectAndCreate(option.type)}
                    disabled={isCreating}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                      isSelected && 'border-primary bg-primary/5',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                      !isCreating && !isSelected && 'hover:bg-accent',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">
                        {t(option.labelKey)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(option.descriptionKey)}
                      </p>
                      {isSelected && isCreating && (
                        <p className="text-xs text-primary mt-2">
                          {t('creating')}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
