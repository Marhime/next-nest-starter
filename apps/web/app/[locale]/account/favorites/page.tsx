'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useFavorites } from '@/hooks/use-favorites';
import { Heart, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property-search';

export default function AccountFavoritesPage() {
  const t = useTranslations('Account.favorites');
  const { favorites, isLoading, error } = useFavorites();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">{t('title')}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">{t('title')}</h1>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive">Error loading favorites</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <span className="text-sm text-muted-foreground">
          {favorites.length}{' '}
          {favorites.length === 1 ? 'propiedad' : 'propiedades'}
        </span>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('noFavorites')}</h3>
              <p className="text-muted-foreground mb-6">{t('addFavorites')}</p>
              <Button onClick={() => router.push('/find')}>
                <Home className="h-4 w-4 mr-2" />
                Explorar propiedades
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
