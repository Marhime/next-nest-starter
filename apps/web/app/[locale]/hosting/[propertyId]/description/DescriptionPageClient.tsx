'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePropertyForm } from '@/hooks/use-property-form';
import { FileText, AlignLeft } from 'lucide-react';
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

  // Validate step access
  useStepValidation(STEP_DESCRIPTION, property, false);

  // ✅ Memoize isValid to ensure it updates correctly
  const isValid = useMemo(
    () => title.trim().length > 0 && description.trim().length > 0,
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
  const handleSuccess = useCallback(
    (_updatedProperty?: unknown) => {
      router.push(`/hosting/${propertyId}/contact`);
    },
    [router, propertyId],
  );

  usePropertyForm({
    propertyId,
    stepIndex: 3,
    isValid,
    payload,
    onSuccess: handleSuccess,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Titre et description</h1>
        <p className="text-muted-foreground text-lg">
          Rendez votre annonce attractive avec un titre accrocheur et une
          description détaillée
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Title */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-medium">Titre de l&apos;annonce</p>
              <p className="text-sm text-muted-foreground">
                Soyez précis et mentionnez les atouts principaux
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Bel appartement lumineux avec vue"
              className="h-12"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="p-3 bg-primary/10 rounded-lg">
              <AlignLeft className="h-8 w-8 text-primary" />
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-medium">Description détaillée</p>
              <p className="text-sm text-muted-foreground">
                Décrivez votre bien : emplacement, état, équipements
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-md space-y-2">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre bien en détail..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {description.length === 0
                  ? 'Minimum 20 caractères'
                  : `${description.length} caractères`}
              </span>
              {description.length > 0 && description.length < 20 && (
                <span className="text-amber-600">Trop court</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DescriptionPageClient;
