'use client';

import { useState } from 'react';
// import { deleteProperty } from '@/lib/actions/properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  surface: number;
  address: string;
  createdAt: string;
};

export function PropertyList({ properties }: { properties: Property[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations('PropertyList');

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    setDeletingId(id);
    // const result = await deleteProperty(id);

    // if (!result.success) {
    //   alert(`${t('deleteError')}: ${result.error}`);
    // }

    setDeletingId(null);
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {t('noProperties')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.id}>
          <CardHeader>
            <CardTitle className="text-lg">{property.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {property.description}
            </p>
            <div className="space-y-1 text-sm mb-4">
              <p>
                <strong>{t('price')}:</strong>{' '}
                {property.price.toLocaleString('fr-FR')} €
              </p>
              <p>
                <strong>{t('surface')}:</strong> {property.surface} m²
              </p>
              <p>
                <strong>{t('address')}:</strong> {property.address}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = `/dashboard/properties/${property.id}/edit`)
                }
              >
                ✏️ {t('edit')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(property.id)}
                disabled={deletingId === property.id}
              >
                {deletingId === property.id
                  ? t('deleting')
                  : `🗑️ ${t('delete')}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
