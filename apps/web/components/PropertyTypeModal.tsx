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
import { PropertyType, useCreateProperty } from '@/hooks/use-create-property';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, Building2, LandPlot, KeyRound, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';

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
  const [listingChoice, setListingChoice] = React.useState<
    'SALE' | 'RENT' | null
  >(null);
  const [selectedType, setSelectedType] = React.useState<PropertyType | null>(
    null,
  );
  const [showResumeDraft, setShowResumeDraft] = React.useState(false);
  const [existingDraft, setExistingDraft] = React.useState<{
    id: number;
    token: string;
  } | null>(null);

  const { createProperty, isCreating } = useCreateProperty();
  const setIsOpen = useGlobalStore((state) => state.setIsPropertyTypeModalOpen);
  const setEditToken = useAddPropertyStore((state) => state.setEditToken);
  const editTokens = useAddPropertyStore((state) => state.editTokens);
  const clearEditToken = useAddPropertyStore((state) => state.clearEditToken);
  const router = useRouter();
  const t = useTranslations('PropertyTypeModal');

  // Check for existing draft on mount
  React.useEffect(() => {
    const tokens = Object.entries(editTokens);
    if (tokens.length > 0) {
      const firstToken = tokens[0];
      if (firstToken) {
        const [propertyId, token] = firstToken;
        setExistingDraft({ id: Number(propertyId), token });
        setShowResumeDraft(true);
      }
    }
  }, [editTokens]);

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

  const handleResumeDraft = () => {
    if (!existingDraft) return;

    setIsOpen?.(false);
    router.push(
      `/hosting/${existingDraft.id}/characteristics?token=${existingDraft.token}`,
    );
  };

  const handleCreateNew = async () => {
    // Delete existing draft
    if (existingDraft) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${apiUrl}/properties/${existingDraft.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'x-edit-token': existingDraft.token,
          },
        });

        clearEditToken(existingDraft.id);
      } catch (error) {
        console.error('Failed to delete draft:', error);
      }
    }

    setShowResumeDraft(false);
    setExistingDraft(null);
  };

  const handleContinue = async () => {
    if (!selectedType || !listingChoice) return;

    try {
      const response = await createProperty({
        propertyType: selectedType,
        listingType: listingChoice,
      });

      // Response can be { id, ... } or { property: { id, ... }, editToken }
      const propertyId =
        (response as any)?.property?.id || (response as any)?.id;

      if (!propertyId) {
        throw new Error('No property ID returned');
      }

      // ✅ Store editToken for anonymous users BEFORE navigating
      const editToken = (response as any)?.editToken;
      if (editToken) {
        console.log('Storing editToken for property', propertyId);
        setEditToken(propertyId, editToken);
      }

      // Close modal, reset and navigate
      setIsOpen?.(false);
      setListingChoice(null);
      setSelectedType(null);

      // ✅ V1 Solution: Add token to URL if present so layout can pick it up immediately
      const url = `/hosting/${propertyId}`;
      router.push(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errorMessage'));
      setSelectedType(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {showResumeDraft
            ? t('resumeDraft.title')
            : listingChoice
              ? t('choosePropertyTypeTitle')
              : t('chooseListingTitle')}
        </DialogTitle>
      </DialogHeader>
      <div className={cn('grid gap-4 pt-4', className)}>
        {/* Resume Draft Dialog */}
        {showResumeDraft && existingDraft && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('resumeDraft.description')}
            </p>

            <button
              className="w-full p-5 rounded-lg border-2 hover:border-primary transition-colors flex items-center gap-4 text-left"
              onClick={handleResumeDraft}
            >
              <div className="flex-1">
                <p className="font-semibold text-base mb-1">
                  {t('resumeDraft.resume')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('resumeDraft.resumeDesc')}
                </p>
              </div>
            </button>

            <button
              className="w-full p-5 rounded-lg border-2 border-destructive/30 hover:border-destructive transition-colors flex items-center gap-4 text-left"
              onClick={handleCreateNew}
            >
              <div className="flex-1">
                <p className="font-semibold text-base mb-1 text-destructive">
                  {t('resumeDraft.createNew')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('resumeDraft.createNewDesc')}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Step: Listing choice */}
        {!showResumeDraft && !listingChoice && (
          <div className="space-y-3">
            <button
              className="w-full p-5 rounded-lg border-2 hover:border-primary transition-colors flex items-center gap-4 text-left group"
              onClick={() => setListingChoice('SALE')}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">{t('listing.sale')}</p>
                <p className="text-sm text-muted-foreground">
                  Vente de bien immobilier
                </p>
              </div>
            </button>

            <button
              className="w-full p-5 rounded-lg border-2 hover:border-primary transition-colors flex items-center gap-4 text-left group"
              onClick={() => setListingChoice('RENT')}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">{t('listing.rent')}</p>
                <p className="text-sm text-muted-foreground">
                  Location longue durée
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Step: Property type selection (shown after listing choice) */}
        {!showResumeDraft && listingChoice && (
          <div className="space-y-4">
            <button
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => setListingChoice(null)}
            >
              ← {t('back')}
            </button>

            <div className="space-y-3">
              {propertyTypes.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;

                return (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    disabled={isCreating}
                    className={cn(
                      'w-full flex items-center gap-4 rounded-lg border-2 p-5 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary',
                      isCreating && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10',
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-1">
                        {t(option.labelKey)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(option.descriptionKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedType || isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? t('creating') : t('continue')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
