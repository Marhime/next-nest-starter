'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { Phone, User, LogIn } from 'lucide-react';
import type { Value as PhoneValue } from 'react-phone-number-input';
import { usePropertyForm } from '@/hooks/use-property-form';
import {
  useStepValidation,
  STEP_CONTACT,
  areAllStepsComplete,
} from '@/hooks/use-step-validation';
import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';

interface Property {
  id: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ContactPageClientProps {
  property: Property;
}

export function ContactPageClient({ property }: ContactPageClientProps) {
  const t = useTranslations('PropertyForm.Contact');
  const tGen = useTranslations('Generic');
  const router = useRouter();
  const setPendingAction = useGlobalStore((s) => s.setPendingAction);
  const setIsLoginModalOpen = useGlobalStore((s) => s.setIsLoginModalOpen);

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  // Validate step access
  useStepValidation(STEP_CONTACT, property, isSessionPending);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '' as PhoneValue,
  });

  // Initialiser le formulaire
  useEffect(() => {
    if (isSessionPending) return;

    // Check for prefilled data from sessionStorage (after login)
    const prefilledData = sessionStorage.getItem('prefill-contact-form');

    if (prefilledData) {
      try {
        const parsed = JSON.parse(prefilledData);
        setFormData({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          phone: (parsed.phone || '') as PhoneValue,
        });
        // Clear the prefilled data after using it
        sessionStorage.removeItem('prefill-contact-form');
        return;
      } catch (error) {
        console.error('Failed to parse prefilled data:', error);
      }
    }

    // Otherwise use session or property data
    if (session?.user) {
      const user = session.user as {
        firstName?: string;
        lastName?: string;
        phone?: string;
      };
      setFormData({
        firstName: user.firstName || property.firstName || '',
        lastName: user.lastName || property.lastName || '',
        phone: (user.phone || property.phone || '') as PhoneValue,
      });
    } else {
      setFormData({
        firstName: property.firstName || '',
        lastName: property.lastName || '',
        phone: (property.phone || '') as PhoneValue,
      });
    }
  }, [session, isSessionPending, property]);

  // Validation
  const isValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.phone.trim().length > 0;

  // ✅ Memoize payload to prevent infinite loops
  const payload = useMemo(
    () => ({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.toString().trim(),
      status: 'ACTIVE',
    }),
    [formData.firstName, formData.lastName, formData.phone],
  );

  // ✅ Memoize validation callback
  const handleValidation = useCallback(async (data: Record<string, string>) => {
    return !!(
      data.firstName &&
      data.lastName &&
      data.phone &&
      data.firstName.trim().length > 0 &&
      data.lastName.trim().length > 0 &&
      data.phone.trim().length > 0
    );
  }, []);

  // ✅ Memoize success callback with stable propertyId
  const propertyId = property.id;
  const handleSuccess = useCallback(
    (updatedProperty: Property | null) => {
      // Use the updated property data from the API response
      if (areAllStepsComplete(updatedProperty)) {
        router.push(`/hosting/${propertyId}/confirmation`);
      } else {
        console.error('Cannot go to confirmation: not all steps complete');
        console.log('Updated property:', updatedProperty);
      }
    },
    [router, propertyId],
  );

  // Utiliser le hook combiné pour gérer tout
  usePropertyForm({
    propertyId,
    stepIndex: 4,
    isValid,
    payload,
    onValidation: handleValidation,
    onSuccess: handleSuccess,
  });

  // Handler pour ouvrir modal de connexion avec form data sauvegardé
  const handleLoginPrompt = useCallback(() => {
    // Sauvegarder les données du formulaire pour pré-remplissage après connexion
    setPendingAction?.({
      type: 'contact',
      context: {
        propertyId,
        formData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        redirectUrl: `/hosting/${propertyId}/contact`,
      },
      timestamp: Date.now(),
      preferredMode: 'register', // Encourager l'inscription pour sauvegarder les infos
    });

    setIsLoginModalOpen?.(true);
  }, [formData, propertyId, setPendingAction, setIsLoginModalOpen]);

  if (isSessionPending) {
    return <div className="p-6">{tGen('loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t('header.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('header.subtitle')}</p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Name Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">{t('name.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('name.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-base font-medium">
                {t('firstName.label')} *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder={t('firstName.placeholder')}
                className="mt-2 text-base h-12"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-base font-medium">
                {t('lastName.label')} *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder={t('lastName.placeholder')}
                className="mt-2 text-base h-12"
              />
            </div>
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">{t('phone.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('phone.subtitle')}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-medium">
              {t('phone.label')} *
            </Label>
            <PhoneInput
              id="phone"
              value={formData.phone}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: (value || '') as PhoneValue,
                }))
              }
              defaultCountry="MX"
              placeholder={t('phone.placeholder')}
              className="mt-2"
            />
          </div>
        </div>

        {/* Authentication Status */}
        {session?.user && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {t('auth.authenticated', { name: session.user.name })}
            </p>
          </div>
        )}

        {!session?.user && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <p className="text-sm text-blue-800">{t('auth.anonymous')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoginPrompt}
              className="w-full sm:w-auto"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t('auth.loginToSave', {
                defaultValue: 'Se connecter pour sauvegarder mes informations',
              })}
            </Button>
            <p className="text-xs text-blue-600">
              {t('auth.loginBenefit', {
                defaultValue:
                  'Connectez-vous pour pré-remplir automatiquement vos coordonnées lors de vos prochaines annonces',
              })}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ContactPageClient;
