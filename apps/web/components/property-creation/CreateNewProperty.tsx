'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateProperty } from '@/hooks/use-create-property';
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
    setSelectedType(type);

    try {
      const property = await createProperty({ propertyType: type });

      toast.success(t('successMessage'));

      if (onSuccess) {
        onSuccess(Number(property.id));
      } else {
        router.push(`/add-property/${property.id}`);
      }
    } catch (error) {
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
    </div>
  );
}

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

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // TODO: Implémenter l'endpoint de duplication dans le backend
      const response = await fetch(
        `${API_URL}/properties/${propertyId}/duplicate`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) throw new Error('Failed to duplicate');

      const newProperty = await response.json();

      toast.success('Annonce dupliquée avec succès !');

      if (onSuccess) {
        onSuccess(newProperty.id);
      } else {
        router.push(`/add-property/${newProperty.id}`);
      }
    } catch {
      toast.error('Erreur lors de la duplication');
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
      {isDuplicating ? 'Duplication...' : 'Dupliquer cette annonce'}
    </Button>
  );
}
