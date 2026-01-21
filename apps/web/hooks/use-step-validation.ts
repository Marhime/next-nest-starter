import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';

// Step indices
export const STEP_LOCATION = 0;
export const STEP_PHOTOS = 1;
export const STEP_ABOUT = 2;
export const STEP_DESCRIPTION = 3;
export const STEP_CONTACT = 4;

// Step paths
const STEP_PATHS = [
  'location',
  'photos',
  'about',
  'description',
  'contact',
] as const;

interface Property {
  id: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  photos?: Array<{ id: number }>;
  bedrooms?: number | null;
  bathrooms?: number | null;
  price?: number | string | null;
  landSurface?: number | null;
  propertyType?: string;
  title?: string | null;
  description?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

/**
 * Validates property data for each step
 * Returns true if the step is complete
 */
export function validateStep(
  stepIndex: number,
  property: Property | null,
): boolean {
  if (!property) return false;

  switch (stepIndex) {
    case STEP_LOCATION:
      // Need valid coordinates
      return !!(property.latitude && property.longitude);

    case STEP_PHOTOS:
      // Need at least 2 photos
      return (property.photos?.length ?? 0) >= 2;

    case STEP_ABOUT:
      // Different validation for LAND vs other property types
      if (property.propertyType === 'LAND') {
        return !!(
          property.landSurface &&
          property.landSurface > 0 &&
          property.price &&
          parseFloat(String(property.price)) > 0
        );
      }
      // For other types: bedrooms, bathrooms, price
      return !!(
        property.bedrooms &&
        property.bedrooms > 0 &&
        property.bathrooms &&
        property.bathrooms > 0 &&
        property.price &&
        parseFloat(String(property.price)) > 0
      );

    case STEP_DESCRIPTION:
      // Need title and description
      return !!(
        property.title &&
        property.title.trim().length > 0 &&
        property.description &&
        property.description.trim().length > 0
      );

    case STEP_CONTACT:
      // Need contact info
      return !!(
        property.firstName &&
        property.firstName.trim().length > 0 &&
        property.lastName &&
        property.lastName.trim().length > 0 &&
        property.phone &&
        property.phone.trim().length > 0
      );

    default:
      return false;
  }
}

/**
 * Find the first incomplete step
 * Returns step index or null if all complete
 */
export function getFirstIncompleteStep(
  property: Property | null,
): number | null {
  if (!property) return STEP_LOCATION;

  for (let i = 0; i <= STEP_CONTACT; i++) {
    if (!validateStep(i, property)) {
      return i;
    }
  }

  return null; // All steps complete
}

/**
 * Check if all required steps are complete
 */
export function areAllStepsComplete(property: Property | null): boolean {
  return getFirstIncompleteStep(property) === null;
}

/**
 * Hook to validate step access and redirect if needed
 * Should be used in each step page
 * MUST be called at the top level, unconditionally, before any early returns
 */
export function useStepValidation(
  currentStepIndex: number,
  property: Property | null,
  isLoading: boolean,
) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const hasCheckedRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const isNavigating = useAddPropertyStore((state) => state.isNavigating);
  const isSaving = useAddPropertyStore((state) => state.isSaving);

  useEffect(() => {
    // ✅ CRITICAL: Don't validate during navigation or saving to prevent race conditions
    if (isNavigating || isSaving) {
      return;
    }

    // Don't validate while loading
    if (isLoading) {
      hasCheckedRef.current = false;
      hasRedirectedRef.current = false;
      return;
    }

    // Don't validate if no property
    if (!property) {
      hasCheckedRef.current = false;
      hasRedirectedRef.current = false;
      return;
    }

    // Skip validation on confirmation page
    if (pathname?.endsWith?.('/confirmation')) return;

    // Only check once per property load to avoid loops
    if (hasCheckedRef.current) return;

    // Mark as checked
    hasCheckedRef.current = true;

    // Get first incomplete step
    const firstIncomplete = getFirstIncompleteStep(property);

    // If all steps complete, allow access to any step
    if (firstIncomplete === null) {
      return;
    }

    // If trying to access a step after the first incomplete step, redirect
    if (currentStepIndex > firstIncomplete && !hasRedirectedRef.current) {
      const redirectPath = `/hosting/${property.id}/${STEP_PATHS[firstIncomplete]}`;
      console.log(
        `Redirecting: step ${currentStepIndex} not accessible, first incomplete is ${firstIncomplete}`,
      );
      hasRedirectedRef.current = true;
      router.replace(redirectPath);
    }
  }, [
    currentStepIndex,
    property?.id,
    isLoading,
    router,
    locale,
    pathname,
    isNavigating,
    isSaving,
    property,
  ]);

  // Reset check when property ID changes
  const prevPropertyIdRef = useRef(property?.id);
  useEffect(() => {
    if (prevPropertyIdRef.current !== property?.id) {
      hasCheckedRef.current = false;
      hasRedirectedRef.current = false;
      prevPropertyIdRef.current = property?.id;
    }
  }, [property?.id]);
}
