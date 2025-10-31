'use client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useAddPropertyStore } from '../store';
import { ReactNode, useEffect } from 'react';
import { useGlobalStore } from '../../store';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { usePathname } from '@/i18n/navigation';

export default function AddPropertyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { propertyId } = params;
  console.log('Params in layout:', params);
  const setIsOpen = useGlobalStore((state) => state.setIsOpen);
  const currentStep = useAddPropertyStore((state) => state.currentStep);

  // Vérifier si la propriété existe
  const { property, isLoading, isError } = useProperty(propertyId as string);

  useEffect(() => {
    // Si propertyId est undefined, vide, ou 'undefined' string
    if (!propertyId || propertyId === 'undefined' || propertyId === '') {
      router.replace('/hosting');
      return;
    }

    // Vérifier si propertyId est un nombre valide
    const id = Number(propertyId);
    if (isNaN(id) || id <= 0) {
      router.replace('/hosting');
      return;
    }

    // Attendre la fin du chargement pour vérifier l'erreur
    if (!isLoading && (isError || !property)) {
      router.replace('/hosting');
    }
  }, [propertyId, isLoading, isError, property, router, pathname]);

  // Afficher un loader pendant la vérification

  const steps = ['overview', 'space-type', 'location', 'photos', 'about'];
  const maxSteps = steps.length - 1;

  return (
    <>
      <section className="h-screen flex flex-col relative">
        <div className="flex w-full justify-between p-4 xl:py-10 xl:px-12">
          <Link href="/">Logo</Link>
          <div className="flex gap-4 xl:gap-6 items-center">
            <Button onClick={() => setIsOpen?.(true)}>Questions ?</Button>
            <Button asChild variant="outline">
              <Link href="/hosting">Save and quit</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1">{children}</div>
        <div className="relative p-4 xl:py-6 xl:px-12">
          <div className="flex justify-between items-center">
            {currentStep !== undefined && steps[currentStep - 1] && (
              <Button variant="link" className="underline text-md">
                <Link href={`/hosting/${propertyId}/${steps[currentStep - 1]}`}>
                  Back
                </Link>
              </Button>
            )}
            <>
              <Button
                asChild
                className="rounded-full px-10 py-6 text-md ml-auto"
              >
                <Link
                  href={
                    currentStep !== undefined && steps[currentStep + 1]
                      ? `/hosting/${propertyId}/${steps[currentStep + 1]}`
                      : `/property/${propertyId}/preview`
                  }
                >
                  {currentStep === maxSteps ? 'Preview' : 'Next'}
                </Link>
              </Button>
              {currentStep !== undefined && steps[currentStep + 1] && (
                <div className="absolute top-0 left-0 w-full">
                  <Progress
                    className="rounded-none"
                    value={currentStep ? (currentStep / maxSteps) * 100 : 0}
                  />
                </div>
              )}
            </>
          </div>
        </div>
      </section>
    </>
  );
}
