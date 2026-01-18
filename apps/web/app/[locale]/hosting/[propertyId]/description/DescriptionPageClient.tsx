'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAddPropertyStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );

  const [title, setTitle] = useState(property.title || '');
  const [description, setDescription] = useState(property.description || '');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Description step is index 3 in the new flow (unchanged)
    setCurrentStep?.(3);
  }, [setCurrentStep]);

  useEffect(() => {
    const isValid = title.trim().length > 0 && description.trim().length > 0;
    setCanProceed?.(isValid);
    if (isValid) setPropertyProgress?.(property.id, 3, true);
  }, [title, description, setCanProceed, property.id, setPropertyProgress]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Titre et description requis');
      return;
    }

    // Include edit token header if present in localStorage (anonymous flow)
    const tokenKey = `property-edit-token:${property.id}`;
    const editToken =
      (typeof window !== 'undefined' && localStorage.getItem(tokenKey)) ||
      undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    console.log(editToken);
    if (editToken) {
      headers['x-edit-token'] = editToken;
    }

    const res = await fetch(`${API_URL}/properties/${property.id}`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save description');
    }

    toast.success('Annonce publiée');
    // advance to next step (pricing) on success
    return true;
  }, [API_URL, property.id, title, description]);

  useEffect(() => {
    const handler = async () => {
      const success = await handleSave();
      if (success) {
        // Navigate to next step (adjust route as needed)
        router.push(`/${locale}/hosting/${property.id}/contact`);
      }
    };

    setHandleNext?.(handler);

    return () => setHandleNext?.(undefined);
  }, [setHandleNext, handleSave, router, locale, property.id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Titre et description</h1>
        <p className="text-muted-foreground text-lg">
          Ajoutez un titre accrocheur et une description complète.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
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
        </div>
      </Card>
    </div>
  );
}

export default DescriptionPageClient;
