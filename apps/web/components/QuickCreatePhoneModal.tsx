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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PropertyType, useCreateProperty } from '@/hooks/use-create-property';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, Building2, LandPlot, KeyRound, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { useEditToken } from '@/hooks/use-edit-token';

interface PropertyTypeOption {
  type: PropertyType;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function QuickCreatePhoneModal() {
  const isOpen = useGlobalStore((s) => s.isQuickCreatePhoneModalOpen);
  const setIsOpen = useGlobalStore((s) => s.setIsQuickCreatePhoneModalOpen);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const t = useTranslations('QuickCreatePhone');

  if (!isOpen) return null;

  if (isDesktop) {
    return (
      <Dialog open={!!isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <QuickCreateContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DrawerDescription>{t('description')}</DrawerDescription>
        </DrawerHeader>
        <QuickCreateContent className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function QuickCreateContent({ className }: { className?: string }) {
  const [listingChoice, setListingChoice] = React.useState<
    'SALE' | 'RENT' | null
  >(null);
  const [selectedType, setSelectedType] = React.useState<PropertyType | null>(
    null,
  );
  const [phone, setPhone] = React.useState('');
  const [createdPropertyId, setCreatedPropertyId] = React.useState<
    string | undefined
  >();

  const { createProperty, isCreating } = useCreateProperty();
  const setIsOpen = useGlobalStore((s) => s.setIsQuickCreatePhoneModalOpen);
  const router = useRouter();
  const t = useTranslations('QuickCreatePhone');
  const { data: session } = authClient.useSession();

  // Initialize hook with propertyId once it's created
  const { setToken } = useEditToken(createdPropertyId);

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

  const handleSaveTokenAndContinue = (token: string, propertyId: string) => {
    console.log(
      '🚀 QuickCreatePhone - handleSaveTokenAndContinue called with:',
      { propertyId }, // ❌ DON'T LOG TOKEN for security
    );

    try {
      // Update state first
      setCreatedPropertyId(propertyId);

      // ✅ Save token to sessionStorage via Zustand store (invisibly)
      const { setEditToken } = useAddPropertyStore.getState();
      setEditToken(parseInt(propertyId), token);
      console.log('✅ Token saved to store (hidden for security)');

      // ❌ DON'T copy to clipboard - token should only be shown at publication
      // User will get it when they publish the property

      console.log('🔄 Navigating to /hosting/' + propertyId);
      // Navigate to property
      router.push(`/hosting/${propertyId}`);
    } catch (error) {
      console.error('❌ Error in handleSaveTokenAndContinue:', error);
      router.push(`/hosting/${propertyId}`);
    }
  };

  const handleCreate = async (type: PropertyType) => {
    console.log('=== QUICK CREATE PROPERTY ===');
    console.log('Property type:', type);
    console.log('Listing choice:', listingChoice);
    console.log('User session:', session?.user ? 'Authenticated' : 'Anonymous');

    setSelectedType(type);

    try {
      // Only pass phone if user is NOT authenticated (anonymous flow)
      const payload: {
        propertyType: PropertyType;
        listingType?: 'SALE' | 'RENT';
        phone?: string;
      } = {
        propertyType: type,
        listingType: (listingChoice || undefined) as
          | 'SALE'
          | 'RENT'
          | undefined,
      };

      // For anonymous users, include phone number
      if (!session?.user && phone) {
        payload.phone = phone;
      }

      console.log('📞 Calling createProperty API with payload:', payload);
      const resp = await createProperty(payload);
      console.log('📦 Create property response:', resp);

      // backend may return { property } or { property, editToken }
      const createdProperty = (resp && (resp.property || resp)) as
        | Record<string, unknown>
        | undefined;
      const createdId = createdProperty
        ? String(createdProperty.id)
        : undefined;

      console.log('🆔 Created property ID:', createdId);
      console.log(
        '🔑 Edit token in response:',
        (resp as Record<string, unknown>)?.editToken,
      );

      // If editToken returned (anonymous create), show token dialog
      if (resp && (resp as Record<string, unknown>).editToken && createdId) {
        console.log('✅ Anonymous flow - saving token and navigating');
        handleSaveTokenAndContinue(
          String((resp as Record<string, unknown>).editToken),
          createdId,
        );
        return;
      }

      // For authenticated flow, just navigate
      if (createdId) {
        console.log('✅ Authenticated flow - closing modal and navigating');
        // close modal then navigate
        setIsOpen?.(false);
        router.push(`/hosting/${createdId}`);
      }
    } catch (err) {
      console.error('❌ Error creating property:', err);
      const message = err instanceof Error ? err.message : t('error');
      toast.error(message);
      setSelectedType(null);
    }
  };

  return (
    <div className={cn('grid gap-4', className)}>
      <div>
        <DialogTitle className="text-lg font-semibold">
          {t('heading')}
        </DialogTitle>
        <p className="text-muted-foreground">{t('hint')}</p>
      </div>

      {!listingChoice && (
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
      )}

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
            {/* Show phone input only for anonymous users */}
            {!session?.user && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('phoneLabel')}</label>
                <input
                  className="w-full rounded-md border p-2"
                  placeholder={t('phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {propertyTypes.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;

              return (
                <button
                  key={option.type}
                  onClick={() => handleCreate(option.type)}
                  disabled={isCreating}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                    isSelected && 'border-primary bg-primary/5',
                    isCreating && 'opacity-50 cursor-not-allowed',
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
  );
}
