'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { Phone, User } from 'lucide-react';
import type { Value as PhoneValue } from 'react-phone-number-input';
import { usePropertyForm } from '@/hooks/use-property-form';
import { useAddPropertyStore } from '../../store';

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
  const locale = useLocale();
  const t = useTranslations('PropertyForm.Contact');
  const tGen = useTranslations('Generic');
  const router = useRouter();

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '' as PhoneValue,
  });

  // Initialiser le formulaire
  useEffect(() => {
    if (isSessionPending) return;

    if (session?.user) {
      const user = session.user as any;
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

  // Utiliser le hook combiné pour gérer tout
  usePropertyForm({
    propertyId: property.id,
    stepIndex: 4,
    isValid,
    payload: {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.toString().trim(),
    },
    onValidation: async (data) => {
      return (
        data.firstName &&
        data.lastName &&
        data.phone &&
        data.firstName.trim().length > 0 &&
        data.lastName.trim().length > 0 &&
        data.phone.trim().length > 0
      );
    },
    onSuccess: () => {
      // Rediriger vers la page de confirmation avec le token
      router.push(`/${locale}/hosting/${property.id}/confirmation`);
    },
  });

  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{t('auth.anonymous')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ContactPageClient;
