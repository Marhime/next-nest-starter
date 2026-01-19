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
import { CheckCircle2, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('PropertyForm.Confirmation');
  const tGen = useTranslations('Generic');

  const { propertyId } = params as { propertyId?: string };
  const { property, isLoading } = useProperty(propertyId || '');
  const { getToken } = useEditToken(propertyId);
  const [copied, setCopied] = useState(false);

  const editToken = getToken();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showEditLink, setShowEditLink] = useState(false);

  // Construct the edit URL with token (no accept param - requires confirmation)
  const editUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/hosting/${propertyId}?token=${editToken}`
      : '';

  // URL with auto-accept (for advanced users who understand the risks)
  const editUrlWithAccept =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/hosting/${propertyId}?token=${editToken}&accept=true`
      : '';

  const handleCopy = async () => {
    if (!editToken) return;

    try {
      await navigator.clipboard.writeText(editToken);
      setCopied(true);
      toast.success('Token copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleCopyLink = async () => {
    if (!editUrl) return;

    try {
      await navigator.clipboard.writeText(editUrl);
      setLinkCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleViewProperty = () => {
    if (property) {
      router.push(`/${locale}/properties/${property.id}`);
    }
  };

  const handleBackToDashboard = () => {
    router.push(`/${locale}/hosting`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tGen('loading')}</p>
        </div>
      </div>
    );
  }

  if (!property || !editToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Propriété introuvable</h2>
            <p className="text-muted-foreground">
              La propriété demandée n'existe pas ou vous n'avez pas les droits
              d'accès.
            </p>
            <Button onClick={handleBackToDashboard}>
              Retour au tableau de bord
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Annonce créée avec succès !
          </h1>
          <p className="text-lg text-muted-foreground">
            Votre bien a été enregistré. Vous pouvez maintenant le modifier à
            tout moment.
          </p>
        </div>

        {/* Property Summary */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Récapitulatif de votre annonce
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Titre</span>
              <span className="font-medium">
                {property.title || 'Sans titre'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">
                {property.propertyType || 'Non défini'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Prix</span>
              <span className="font-medium">
                {property.price
                  ? `${new Intl.NumberFormat('fr-FR').format(Number(property.price))} MXN`
                  : 'Non défini'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Statut</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {property.status || 'DRAFT'}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit Token Card - Important */}
        <Card className="p-6 bg-amber-50 border-2 border-amber-300 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Token d'édition - À conserver précieusement
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                Ce token vous permet de modifier votre annonce sans compte. Ne
                le partagez avec personne et conservez-le dans un endroit sûr.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={editToken}
                className="font-mono text-sm bg-white"
              />
              <Button
                onClick={handleCopy}
                variant={copied ? 'default' : 'outline'}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="bg-amber-100 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-900 font-medium mb-2">
                📋 Comment utiliser ce token ?
              </p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>Gardez-le dans un fichier texte sécurisé</li>
                <li>Prenez une capture d&apos;écran de cette page</li>
                <li>
                  Pour modifier l&apos;annonce, retournez sur la page de
                  modification avec ce token
                </li>
                <li>Ne le partagez jamais publiquement</li>
              </ul>
            </div>

            {/* Guard - User must acknowledge before seeing edit link */}
            {!showEditLink ? (
              <div className="border-t border-amber-200 pt-4">
                <p className="text-sm text-amber-900 font-medium mb-3">
                  🔗 Obtenir le lien direct d&apos;édition
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Ce lien contient votre token et permet d&apos;accéder
                  directement à l&apos;édition. Cliquez ci-dessous uniquement si
                  vous comprenez les risques de sécurité.
                </p>
                <Button
                  onClick={() => setShowEditLink(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  J&apos;ai compris, afficher le lien
                </Button>
              </div>
            ) : (
              <div className="border-t border-amber-200 pt-4">
                <p className="text-sm text-amber-900 font-medium mb-2">
                  🔗 Lien direct pour modifier cette annonce
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Copiez ce lien pour accéder directement à l&apos;édition de
                  votre annonce depuis n&apos;importe quel appareil :
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={editUrl}
                    className="font-mono text-xs bg-white text-blue-600"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={linkCopied ? 'default' : 'outline'}
                    className="flex-shrink-0"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  ⚠️ Ce lien contient votre token. Ne le partagez qu&apos;avec
                  des personnes de confiance.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleViewProperty}
            size="lg"
            className="flex-1 group"
          >
            Voir l'annonce
            <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={handleBackToDashboard}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            Tableau de bord
          </Button>
        </div>

        {/* Help Section */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Besoin d'aide ?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Si vous avez perdu votre token d'édition, vous devrez créer un
            compte pour récupérer l'accès à votre annonce.
          </p>
          <Link href={`/${locale}/auth/signup`}>
            <Button variant="link" className="p-0 h-auto">
              Créer un compte →
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
