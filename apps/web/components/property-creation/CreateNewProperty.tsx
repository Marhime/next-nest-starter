'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateProperty } from '@/hooks/use-create-property';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Home, Building2, LandPlot, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND';

interface PropertyTypeOption {
  type: PropertyType;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

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

interface CreateNewPropertyProps {
  onSuccess?: (propertyId: number) => void;
}

export function CreateNewProperty({ onSuccess }: CreateNewPropertyProps) {
  const [selectedType, setSelectedType] = React.useState<PropertyType | null>(
    null,
  );
  const { createProperty, isCreating } = useCreateProperty();
  const router = useRouter();
  const t = useTranslations('PropertyTypeModal');

  const handleSelectAndCreate = async (type: PropertyType) => {
    console.log('=== CREATING PROPERTY ===');
    console.log('Property type:', type);
    setSelectedType(type);

    try {
      console.log('Calling createProperty API...');
      const resp = await createProperty({ propertyType: type });
      console.log('Create property response:', resp);

      // Normalize: get property object
      const createdProperty = (resp && (resp.property || resp)) as
        | Record<string, unknown>
        | undefined;

      // Extract id safely
      const createdId = createdProperty
        ? String((createdProperty as Record<string, unknown>).id)
        : undefined;

      console.log('Created property ID:', createdId);

      if (!createdId) {
        throw new Error('No property ID returned');
      }

      // ✅ If backend returned an editToken (anonymous user only)
      if (resp && (resp as Record<string, unknown>).editToken) {
        console.log('Anonymous user - saving editToken');
        const token = String((resp as Record<string, unknown>).editToken);

        // Save token to sessionStorage via Zustand store
        const { setEditToken } = useAddPropertyStore.getState();
        setEditToken(parseInt(createdId), token);
        console.log('Token saved to store for anonymous user');
      } else {
        console.log('Authenticated user - no editToken needed');
      }

      // Navigate to property wizard
      if (onSuccess) {
        onSuccess(Number(createdId));
      } else {
        router.push(`/hosting/${createdId}`);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error(error instanceof Error ? error.message : t('errorMessage'));
      setSelectedType(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Quel type de bien proposez-vous ?
        </h2>
        <p className="text-muted-foreground">
          Choisissez le type qui correspond le mieux à votre bien
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {propertyTypes.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;
          const isDisabled = isCreating && !isSelected;

          return (
            <Card
              key={option.type}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-2 ring-primary',
                isDisabled && 'opacity-50 cursor-not-allowed',
              )}
              onClick={() => !isCreating && handleSelectAndCreate(option.type)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
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
                  <div>
                    <CardTitle className="text-lg">
                      {t(option.labelKey)}
                    </CardTitle>
                    <CardDescription>
                      {t(option.descriptionKey)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {isSelected && isCreating && (
                <CardContent>
                  <p className="text-sm text-primary">{t('creating')}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
      {/* One-time token dialog shown after anonymous creation */}
    </div>
  );
}

// Token dialog state type and dialog UI handled below using the existing Dialog component

interface DuplicatePropertyProps {
  propertyId: number;
  onSuccess?: (propertyId: number) => void;
}

export function DuplicateProperty({
  propertyId,
  onSuccess,
}: DuplicatePropertyProps) {
  const [isDuplicating, setIsDuplicating] = React.useState(false);
  const router = useRouter();
  const t = useTranslations('DuplicateProperty');

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const duplicatePromise = async () => {
        const response = await fetch(
          `${API_URL}/properties/${propertyId}/duplicate`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        if (!response.ok) throw new Error('Failed to duplicate');
        return response.json();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newProperty: any = await toast.promise(duplicatePromise(), {
        loading: t('duplicating') || 'Duplication...',
        success: t('success'),
        error: t('error'),
      });

      if (onSuccess) {
        onSuccess(newProperty.id);
      } else {
        router.push(`/hosting/${newProperty.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className="w-full"
    >
      <Copy className="h-4 w-4 mr-2" />
      {isDuplicating ? t('duplicating') : t('button')}
    </Button>
  );
}
