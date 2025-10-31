'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Copy, Home as HomeIcon } from 'lucide-react';
import { PropertyList } from '@/components/property-creation/PropertyList';
import { CreateNewProperty } from '@/components/property-creation/CreateNewProperty';
import { useUserProperties } from '@/hooks/use-properties';

export default function AddPropertyPage() {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showDuplicateFrom, setShowDuplicateFrom] = React.useState(false);
  const { properties, isLoading } = useUserProperties();
  const router = useRouter();

  console.log('properties:', properties);

  const handlePropertyCreated = (propertyId: number) => {
    router.push(`/hosting/${propertyId}`);
  };

  if (showCreateForm) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowCreateForm(false)}
            className="mb-4"
          >
            ← Retour
          </Button>
        </div>
        <CreateNewProperty onSuccess={handlePropertyCreated} />
      </div>
    );
  }

  if (showDuplicateFrom) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowDuplicateFrom(false)}
            className="mb-4"
          >
            ← Retour
          </Button>
          <h1 className="text-3xl font-bold">
            Créer à partir d&apos;une annonce existante
          </h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez l&apos;annonce que vous souhaitez dupliquer
          </p>
        </div>
        <PropertyList />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bienvenue dans votre espace hôte
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Créez et gérez vos annonces immobilières en toute simplicité
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Démarrer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Créer une nouvelle annonce</CardTitle>
                    <CardDescription>
                      Commencer de zéro avec votre nouveau bien
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`cursor-pointer hover:shadow-lg transition-all hover:border-primary ${
                properties.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() =>
                properties.length > 0 && setShowDuplicateFrom(true)
              }
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Copy className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Dupliquer une annonce</CardTitle>
                    <CardDescription>
                      Gagner du temps en partant d&apos;une annonce existante
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Properties List */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Vos annonces</h2>
            {properties.length > 0 && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <HomeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Chargement de vos annonces...
                </p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <HomeIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Vous n&apos;avez pas encore d&apos;annonce
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez par créer votre première annonce immobilière
                  </p>
                  <Button onClick={() => setShowCreateForm(true)} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première annonce
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PropertyList />
          )}
        </div>

        {/* Help Section */}
        <Separator className="my-12" />

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Centre d&apos;aide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Trouvez des réponses à vos questions et des conseils pour créer
                une annonce attractive
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conseils d&apos;expert</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Découvrez les meilleures pratiques pour optimiser vos annonces
                et attirer plus de visiteurs
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communauté</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Échangez avec d&apos;autres hôtes et partagez vos expériences
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
