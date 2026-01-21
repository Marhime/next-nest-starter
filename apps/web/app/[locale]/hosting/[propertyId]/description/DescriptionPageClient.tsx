'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePropertyForm } from '@/hooks/use-property-form';
import {
  useStepValidation,
  STEP_DESCRIPTION,
} from '@/hooks/use-step-validation';

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
  const router = useRouter();

  const [title, setTitle] = useState(property.title || '');
  const [description, setDescription] = useState(property.description || '');

  // Sync with property changes
  useEffect(() => {
    setTitle(property.title || '');
    setDescription(property.description || '');
  }, [property.title, property.description]);

  // Validate step access
  useStepValidation(STEP_DESCRIPTION, property, false);

  // ✅ Memoize isValid to ensure it updates correctly
  const isValid = useMemo(
    () => title.trim().length > 0 && description.trim().length >= 20,
    [title, description],
  );

  // ✅ Memoize payload to prevent infinite loops
  const payload = useMemo(
    () => ({
      title: title.trim(),
      description: description.trim(),
    }),
    [title, description],
  );

  // ✅ Memoize success callback with stable propertyId
  const propertyId = property.id;
  const handleSuccess = useCallback(() => {
    router.push(`/hosting/${propertyId}/contact`);
  }, [router, propertyId]);

  usePropertyForm({
    propertyId,
    stepIndex: 3,
    isValid,
    payload,
    onSuccess: handleSuccess,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Titre et description</h1>
        <p className="text-muted-foreground">Rendez votre annonce attractive</p>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <label htmlFor="title" className="text-base font-medium block">
            Titre de l&apos;annonce
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Bel appartement lumineux avec vue"
            className="h-12 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Soyez précis et mentionnez les atouts principaux
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label htmlFor="description" className="text-base font-medium block">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre bien : emplacement, état, équipements, points forts..."
            className="min-h-[200px] resize-none text-base"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {description.length === 0
                ? 'Minimum 20 caractères'
                : `${description.length} caractères`}
            </span>
            {description.length > 0 && description.length < 20 && (
              <span className="text-amber-600 font-medium">Trop court</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionPageClient;
