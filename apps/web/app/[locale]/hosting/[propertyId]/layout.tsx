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
import { useTranslations } from 'next-intl';
import { QueryProvider } from '@/components/providers/QueryProvider';

export default function AddPropertyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations('PropertyForm');
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { propertyId } = params;
  console.log('Params in layout:', params);
  const setIsOpen = useGlobalStore((state) => state.setIsOpen);
  const currentStep = useAddPropertyStore((state) => state.currentStep);
  const canProceed = useAddPropertyStore((state) => state.canProceed);
  const handleNext = useAddPropertyStore((state) => state.handleNext);

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

  // Wizard order: location -> photos -> characteristics -> description -> pricing
  const steps = [
    'location',
    'photos',
    'characteristics',
    'description',
    'pricing',
  ];
  const maxSteps = steps.length - 1;

  return (
    <QueryProvider>
      <section className="min-h-screen flex flex-col relative">
        <div className="flex w-full justify-between p-4 xl:py-10 xl:px-12">
          <Link href="/">Logo</Link>
          <div className="flex gap-4 xl:gap-6 items-center">
            <Button onClick={() => setIsOpen?.(true)}>
              {t('navigation.questions')}
            </Button>
            <Button asChild variant="outline">
              <Link href="/hosting">{t('navigation.saveAndQuit')}</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 pb-[96px]">{children}</div>
        <div className="fixed bottom-0 left-0 right-0 p-4 xl:py-6 xl:px-12 bg-white">
          <div className="flex justify-between items-center">
            {currentStep !== undefined && steps[currentStep - 1] && (
              <Button variant="link" className="underline text-md">
                <Link href={`/hosting/${propertyId}/${steps[currentStep - 1]}`}>
                  {t('navigation.back')}
                </Link>
              </Button>
            )}
            <>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('Next button clicked, handleNext:', handleNext);
                  console.log('canProceed:', canProceed);
                  console.log('currentStep:', currentStep);

                  if (handleNext) {
                    console.log('Calling handleNext');
                    await handleNext();
                  } else {
                    console.log('No handleNext, using fallback navigation');
                    // Fallback: navigation directe si pas de handler
                    const nextUrl =
                      currentStep !== undefined && steps[currentStep + 1]
                        ? `/hosting/${propertyId}/${steps[currentStep + 1]}`
                        : `/property/${propertyId}`;
                    console.log('Navigating to:', nextUrl);
                    router.push(nextUrl);
                  }
                }}
                disabled={!canProceed && currentStep !== 0}
                className="rounded-full px-10 py-6 text-md ml-auto"
              >
                {currentStep === maxSteps
                  ? t('navigation.publish')
                  : t('navigation.next')}
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
    </QueryProvider>
  );
}
