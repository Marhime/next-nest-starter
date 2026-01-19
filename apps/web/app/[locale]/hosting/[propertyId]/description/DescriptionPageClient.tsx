'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useAddPropertyStore } from '../../store';
import { usePropertyForm } from '@/hooks/use-property-form';

interface Property {
  id: number;
  title?: string;
  description?: string;
}

interface DescriptionPageClientProps {
  property: Property;
}

export function DescriptionPageClient({
  property,
}: DescriptionPageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('PropertyForm');

  const [title, setTitle] = useState(property.title || '');
  const [description, setDescription] = useState(property.description || '');

  const isValid = title.trim().length > 0 && description.trim().length > 0;

  usePropertyForm({
    propertyId: property.id,
    stepIndex: 3,
    isValid,
    payload: {
      title: title.trim(),
      description: description.trim(),
    },
    onSuccess: () => {
      router.push(`/${locale}/hosting/${property.id}/contact`);
    },
  });

  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  useEffect(() => {
    setCurrentStep?.(3);
  }, [setCurrentStep]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Titre et description</h1>
        <p className="text-muted-foreground text-lg">
          Ajoutez un titre accrocheur et une description complète.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              Titre *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Bel appartement lumineux"
              className="mt-2 text-base h-12"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre bien..."
              className="mt-2 min-h-[150px] text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {description.length} caractères
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DescriptionPageClient;
