'use client';

import { useParams } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useEditToken } from '@/hooks/use-edit-token';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  CheckCircle2,
  Copy,
  AlertCircle,
  ExternalLink,
  User,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { areAllStepsComplete } from '@/hooks/use-step-validation';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';
import { PropertyCard } from '@/components/property-search/PropertyCard';

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Confirmation');

  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading } = useProperty(propertyId || '');
  const { getToken } = useEditToken(propertyId);
  const { data: session } = authClient.useSession();
  const clearEditToken = useAddPropertyStore((state) => state.clearEditToken);

  const [copied, setCopied] = useState(false);

  const editToken = getToken();
  const isAnonymous = !session?.user;

  // ❌ Disabled: This validation fires before layout mutate() completes
  // The redirect happens too fast, making the confirmation page flash
  // Let the layout handle navigation validation instead
  // useEffect(() => {
  //   if (!isLoading && property) {
  //     const allComplete = areAllStepsComplete(property);
  //     if (!allComplete) {
  //       console.log('Not all steps complete, redirecting to contact');
  //       router.replace(`/hosting/${propertyId}/contact`);
  //     }
  //   }
  // }, [property, isLoading, router, propertyId]);

  // ✅ Clean up draft token when property is published (status = ACTIVE)
  useEffect(() => {
    if (!isLoading && property && isAnonymous && propertyId) {
      // Si la propriété est ACTIVE, elle n'est plus un brouillon
      // On nettoie le token pour qu'elle ne s'affiche plus dans "Reprendre un brouillon"
      if (property.status === 'ACTIVE') {
        console.log('Property is ACTIVE, clearing draft token from store');
        clearEditToken(Number(propertyId));
      }
    }
  }, [property, isLoading, isAnonymous, propertyId, clearEditToken]);

  const editUrl =
    typeof window !== 'undefined' && editToken
      ? `${window.location.origin}/hosting/${propertyId}?token=${editToken}`
      : '';

  const handleCopyToken = async () => {
    if (!editUrl) return;
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t('propertyNotFound')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('propertyNotFoundDesc')}
          </p>
          <Button onClick={() => router.push(`/${locale}/hosting`)}>
            {t('backToDashboard')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {property.title || t('noTitle')}
        </p>
      </div>

      {/* Property Preview */}
      <div className="flex justify-center">
        <PropertyCard property={property as any} />
      </div>

      {/* Create Account CTA - Priority for anonymous users */}
      {isAnonymous && (
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{t('needAccount')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('needAccountDesc')}
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t('securityTitle')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('securityDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">
                      {t('managementTitle')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('managementDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link href={`/${locale}/auth/signup`}>
            <Button size="lg" className="w-full">
              {t('createAccount')}
            </Button>
          </Link>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <div className="space-y-3">
          <Button
            onClick={() => router.push(`/${locale}/properties/${property.id}`)}
            size="lg"
            variant={isAnonymous ? 'outline' : 'default'}
            className="w-full"
          >
            {t('viewListing')}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button
            onClick={() => router.push(`/${locale}/hosting`)}
            size="lg"
            variant="outline"
            className="w-full"
          >
            {t('backToDashboard')}
          </Button>
        </div>
      </Card>

      {/* Edit Link Section - Visible but secondary */}
      {isAnonymous && editToken && (
        <Card className="p-6 bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                {t('editLinkTitle')}
              </h3>
              <p className="text-sm text-amber-800 mb-4">{t('editLinkDesc')}</p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={editUrl}
                    className="font-mono text-xs bg-white"
                  />
                  <Button
                    onClick={handleCopyToken}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="bg-amber-100/50 rounded-lg p-3">
                  <p className="text-xs text-amber-900 font-medium mb-2">
                    {t('securityTipsTitle')}
                  </p>
                  <ul className="text-xs text-amber-800 space-y-1.5">
                    <li>• {t('securityTip1')}</li>
                    <li>• {t('securityTip2')}</li>
                    <li>• {t('securityTip3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
