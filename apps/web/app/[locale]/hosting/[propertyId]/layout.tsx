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
import Image from 'next/image';
import { authClient } from '@/lib/auth/auth-client';
import { PROPERTY_STEPS, MAX_STEP_INDEX } from '@/lib/step-config';
import { useEditToken } from '@/hooks/use-edit-token';
import { useTokenFromUrl } from '@/hooks/use-token-from-url';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PropertyProvider } from './PropertyContext';

export default function AddPropertyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations('PropertyForm');
  const tToken = useTranslations('TokenDialog');
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { propertyId } = params;
  const setIsOpen = useGlobalStore((state) => state.setIsOpen);
  const currentStep = useAddPropertyStore((state) => state.currentStep);
  const canProceed = useAddPropertyStore((state) => state.canProceed);
  const handleNext = useAddPropertyStore((state) => state.handleNext);
  const isSaving = useAddPropertyStore((state) => state.isSaving);

  // ✅ Extract token from URL if present (?token=xxx) with guard
  const { pendingToken, acceptToken, rejectToken } =
    useTokenFromUrl(propertyId);

  // Get edit token - must be at top level, not inside useEffect
  const { token: editToken, getToken } = useEditToken(propertyId as string);

  // Debug: Vérifier le store directement
  useEffect(() => {
    if (propertyId) {
      const storeState = useAddPropertyStore.getState();
      console.log('Store editTokens:', storeState.editTokens);
      console.log('Token for property', propertyId, ':', editToken);

      // Vérifier sessionStorage directement
      try {
        const storageKey = 'add-property-storage';
        const stored = sessionStorage.getItem(storageKey);
        console.log('SessionStorage raw:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log(
            'SessionStorage parsed editTokens:',
            parsed.state?.editTokens,
          );
        }
      } catch (e) {
        console.error('Error reading sessionStorage:', e);
      }
    }
  }, [propertyId, editToken]);

  // Vérifier si la propriété existe - passer le token pour qu'il soit retourné par l'API
  // Utiliser 'editToken' au lieu de 'getToken()' pour éviter une boucle infinie
  const { property, isLoading, isError, mutate } = useProperty(
    propertyId as string,
    editToken,
  );

  // ✅ Synchronize isSaving with loading state to block validations during data refresh
  const setIsSaving = useAddPropertyStore((state) => state.setIsSaving);
  useEffect(() => {
    if (isLoading) {
      setIsSaving?.(true);
    } else {
      // Keep isSaving true for a short delay after loading to ensure data propagation
      const timer = setTimeout(() => {
        setIsSaving?.(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setIsSaving]);

  const isConfirmationStep = pathname.endsWith('/confirmation');

  // get user
  const { data: session } = authClient.useSession();

  // Vérifier les permissions d'accès à la propriété
  useEffect(() => {
    if (!property) return;

    // ⚠️ Ne pas vérifier les permissions si un token est en attente de confirmation
    if (pendingToken) {
      console.log('Skipping permission check: token pending confirmation');
      return;
    }

    const isAuthenticated = !!session?.user;
    const isOwner = session?.user?.id === property.userId;

    console.log('Permission check:', {
      isAuthenticated,
      isOwner,
      propertyUserId: property.userId,
      sessionUserId: session?.user?.id,
    });

    // ✅ Si authentifié : doit être propriétaire
    if (isAuthenticated) {
      if (!isOwner) {
        console.log('Redirecting: authenticated but not owner');
        router.replace('/');
        return;
      }
      console.log('Access granted: authenticated owner');
      return;
    }

    // ✅ Si anonyme : doit avoir un token valide
    const editToken = getToken();
    const hasValidToken = editToken && editToken === property.editToken;

    console.log('Anonymous user check:', {
      editToken: editToken ? `${editToken.substring(0, 20)}...` : 'none',
      propertyEditToken: property.editToken
        ? `${property.editToken.substring(0, 20)}...`
        : 'none',
      hasValidToken,
    });

    if (!hasValidToken) {
      console.log('Redirecting: anonymous without valid token');
      router.replace('/');
      return;
    }

    console.log('Access granted: anonymous with valid token');
  }, [property, session, router, getToken, pendingToken]);

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

  return (
    <QueryProvider>
      <PropertyProvider
        value={{
          property,
          isLoading,
          isError,
          mutate: async () => {
            const result = await mutate();
            return result;
          },
        }}
      >
        <section className="min-h-screen flex flex-col relative">
          <div className="flex w-full justify-between p-4 xl:py-10 xl:px-12">
            <Link href="/">
              <Image
                src="/logo1.svg"
                alt="Home image showcase"
                width={170}
                height={30}
                priority
              />
            </Link>
            <div className="flex gap-4 xl:gap-6 items-center">
              <Button onClick={() => setIsOpen?.(true)}>
                {t('navigation.questions')}
              </Button>
              <Button asChild variant="outline">
                <Link href="/hosting">
                  {isConfirmationStep
                    ? t('navigation.quit')
                    : t('navigation.saveAndQuit')}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 pb-[96px]">{children}</div>
          {!isConfirmationStep && (
            <div className="fixed bottom-0 left-0 right-0 p-4 xl:py-6 xl:px-12 bg-white">
              <div className="flex justify-between items-center">
                {currentStep !== undefined &&
                  currentStep > 0 &&
                  PROPERTY_STEPS !== undefined &&
                  PROPERTY_STEPS[currentStep - 1] && (
                    <Button variant="link" className="underline text-md">
                      <Link
                        href={`/hosting/${propertyId}/${PROPERTY_STEPS[currentStep - 1]?.route}`}
                      >
                        {t('navigation.back')}
                      </Link>
                    </Button>
                  )}
                <>
                  <Button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (handleNext) {
                        await handleNext();
                      } else {
                        // Fallback: navigation directe
                        if (
                          currentStep !== undefined &&
                          currentStep < MAX_STEP_INDEX
                        ) {
                          router.push(
                            `/hosting/${propertyId}/${PROPERTY_STEPS[currentStep + 1]?.route}`,
                          );
                        } else {
                          router.push('/hosting');
                        }
                      }
                    }}
                    disabled={!canProceed || isSaving}
                    className="rounded-full px-10 py-6 text-md ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('messages.saving')}
                      </>
                    ) : currentStep === MAX_STEP_INDEX ? (
                      t('navigation.publish')
                    ) : (
                      t('navigation.next')
                    )}
                  </Button>
                  {currentStep !== undefined && (
                    <div className="absolute top-0 left-0 w-full">
                      <Progress
                        className="rounded-none"
                        value={
                          currentStep ? (currentStep / MAX_STEP_INDEX) * 100 : 0
                        }
                      />
                    </div>
                  )}
                </>
              </div>
            </div>
          )}
        </section>

        {/* Token Confirmation Dialog */}
        <AlertDialog open={!!pendingToken}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tToken('title')}</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>{tToken('description')}</p>
                <p className="text-amber-600 font-medium">
                  {tToken('acceptDescription')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tToken('tokenLabel')}{' '}
                  <code className="bg-muted px-2 py-1 rounded">
                    {pendingToken?.token.substring(0, 20)}...
                  </code>
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={rejectToken}>
                {tToken('reject')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={acceptToken}>
                {tToken('accept')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PropertyProvider>
    </QueryProvider>
  );
}
