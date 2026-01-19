'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAddPropertyStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { Phone, User } from 'lucide-react';
import type { Value as PhoneValue } from 'react-phone-number-input';

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
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('PropertyForm.Contact');
  const tGen = useTranslations('Generic');

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '' as PhoneValue,
  });

  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Initialize form data
  useEffect(() => {
    if (isSessionPending) return;

    // For authenticated users: prefer user session data, fallback to property data
    if (session?.user) {
      const user = session.user as any;
      setFormData({
        firstName: user.firstName || property.firstName || '',
        lastName: user.lastName || property.lastName || '',
        phone: (user.phone || property.phone || '') as PhoneValue,
      });
    } else {
      // For anonymous users: use property data if available
      setFormData({
        firstName: property.firstName || '',
        lastName: property.lastName || '',
        phone: (property.phone || '') as PhoneValue,
      });
    }
  }, [session, isSessionPending, property]);

  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid =
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.phone.trim().length > 0;

    setCanProceed?.(isValid);

    if (isValid) {
      setPropertyProgress?.(property.id, 4, true);
    }
  }, [formData, setCanProceed, property.id, setPropertyProgress]);

  const handleSave = useCallback(async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim()
    ) {
      toast.error(t('errors.required'));
      return;
    }

    setIsLoading(true);

    try {
      // Get edit token from localStorage for anonymous flow
      const tokenKey = `property-edit-token:${property.id}`;
      const editToken =
        (typeof window !== 'undefined' && localStorage.getItem(tokenKey)) ||
        undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (editToken) {
        headers['x-edit-token'] = editToken;
      }

      // For authenticated users: update user profile and property
      // For anonymous: update property only
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      };

      const res = await fetch(`${API_URL}/properties/${property.id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t('errors.saveFailed'));
      }

      toast.success(t('success'));
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.saveFailed');
      toast.error(message);
      console.error('Contact save failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, property.id, formData, t]);

  useEffect(() => {
    const handler = async () => {
      const success = await handleSave();
      if (success) {
        // Navigate to next step or dashboard if this is the last step
        router.push(`/${locale}/hosting`);
      }
    };

    setHandleNext?.(handler);

    return () => setHandleNext?.(undefined);
  }, [setHandleNext, handleSave, router, locale]);

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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{t('auth.anonymous')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ContactPageClient;
