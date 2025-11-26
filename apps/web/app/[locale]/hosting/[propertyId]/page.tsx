'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAddPropertyStore } from '../store';
import { useProperty } from '@/hooks/use-properties';
import { Loader2 } from 'lucide-react';

/**
 * This page automatically redirects to the first incomplete step
 * or the current step in progress
 */
export default function PropertyRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { propertyId } = params;
  const getCurrentPropertyStep = useAddPropertyStore(
    (state) => state.getCurrentPropertyStep,
  );

  const { property, isLoading } = useProperty(propertyId as string);

  useEffect(() => {
    if (isLoading || !property) return;

    const steps = ['type', 'location', 'photos', 'about'];
    const propertyIdNum = Number(propertyId);

    // Get the current step for this property
    const currentStep = getCurrentPropertyStep(propertyIdNum);

    // Redirect to the appropriate step
    const targetStep = steps[currentStep] || 'type';
    router.replace(`/hosting/${propertyId}/${targetStep}`);
  }, [propertyId, property, isLoading, getCurrentPropertyStep, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
