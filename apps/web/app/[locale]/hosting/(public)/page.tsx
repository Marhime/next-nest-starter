'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Home as HomeIcon } from 'lucide-react';
import { PropertyList } from '@/components/property-creation/PropertyList';
import { CreateNewProperty } from '@/components/property-creation/CreateNewProperty';
import { useUserProperties } from '@/hooks/use-properties';

export default function AddPropertyPage() {
  const t = useTranslations('HostingPage');
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
            {t('back')}
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
            {t('back')}
          </Button>
          <h1 className="text-3xl font-bold">{t('duplicateFrom')}</h1>
          <p className="text-muted-foreground mt-2">{t('selectToDuplicate')}</p>
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
              {t('welcomeTitle')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Quick Actions */}

        {/* Properties List */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t('yourListings')}</h2>
            {properties.length > 0 && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('newListing')}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <HomeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('loading')}</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <HomeIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('noListingsYet')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('createFirst')}
                  </p>
                  <Button onClick={() => setShowCreateForm(true)} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createMyFirst')}
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
              <CardTitle className="text-lg">{t('helpCenter')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('helpCenterDescription')}</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('expertTips')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('expertTipsDescription')}</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('community')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('communityDescription')}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
