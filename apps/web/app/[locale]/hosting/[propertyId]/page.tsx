'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { Loader2 } from 'lucide-react';
import { PROPERTY_STEPS } from '@/lib/step-config';

/**
 * Redirect page - automatically routes to first step or confirmation
 * Keeps wizard flow simple and predictable
 */
export default function PropertyRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { propertyId } = params;
  const { property, isLoading } = useProperty(propertyId as string);

  useEffect(() => {
    if (isLoading || !property) return;

    // If property is published/completed, go to confirmation
    // Otherwise, start at first step (location)
    if (property.status === 'PUBLISHED') {
      router.replace(`/hosting/${propertyId}/confirmation`);
    } else {
      router.replace(`/hosting/${propertyId}/${PROPERTY_STEPS[0].route}`);
    }
  }, [propertyId, property, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
