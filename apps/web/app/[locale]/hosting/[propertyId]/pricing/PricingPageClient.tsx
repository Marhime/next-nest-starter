'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAddPropertyStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Property {
  id: number;
  monthlyPrice?: number;
  nightlyPrice?: number;
  salePrice?: number;
  amenities?: string[];
}

interface PricingPageClientProps {
  property: Property;
}

export function PricingPageClient({ property }: PricingPageClientProps) {
  const router = useRouter();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);
  const setPropertyProgress = useAddPropertyStore(
    (state) => state.setPropertyProgress,
  );

  const [monthlyPrice, setMonthlyPrice] = useState(
    property.monthlyPrice ? String(property.monthlyPrice) : '',
  );
  const [nightlyPrice, setNightlyPrice] = useState(
    property.nightlyPrice ? String(property.nightlyPrice) : '',
  );
  const [salePrice, setSalePrice] = useState(
    property.salePrice ? String(property.salePrice) : '',
  );
  const [deposit, setDeposit] = useState(() => {
    const dep = (property.amenities || []).find((a) =>
      String(a).startsWith('security_deposit:'),
    );
    return dep ? String(dep).split(':')[1] : '';
  });

  useEffect(() => {
    // Pricing is the final step index 4 in the new flow
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  useEffect(() => {
    // Valid if at least one price is set
    const isValid = !!monthlyPrice || !!nightlyPrice || !!salePrice;
    setCanProceed?.(isValid);
    if (isValid) setPropertyProgress?.(property.id, 4, true);
  }, [
    monthlyPrice,
    nightlyPrice,
    salePrice,
    setCanProceed,
    property.id,
    setPropertyProgress,
  ]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleSave = useCallback(async () => {
    // Build amenities array: preserve other amenities but replace deposit token
    const existing = Array.isArray(property.amenities)
      ? [...property.amenities]
      : [];
    const filtered = existing.filter(
      (a) => !String(a).startsWith('security_deposit:'),
    );
    if (deposit && deposit.trim() !== '')
      filtered.push(`security_deposit:${deposit}`);

    const body: Record<string, unknown> = {
      monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
      nightlyPrice: nightlyPrice ? parseFloat(nightlyPrice) : null,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      amenities: filtered,
    };

    const res = await fetch(`${API_URL}/properties/${property.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save pricing');
    }

    toast.success('Tarifs sauvegardés');
    // After pricing, redirect to overview or finish
    router.push(`/hosting/${property.id}`);
  }, [
    API_URL,
    property,
    monthlyPrice,
    nightlyPrice,
    salePrice,
    deposit,
    router,
  ]);

  useEffect(() => {
    setHandleNext?.(() => handleSave);
    return () => setHandleNext?.(undefined);
  }, [handleSave, setHandleNext]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Prix et dépôt de garantie</h1>
        <p className="text-muted-foreground text-lg">
          Définissez les tarifs selon le type d&apos;annonce et ajoutez un dépôt
          si nécessaire.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="monthlyPrice">Prix mensuel (MXN)</Label>
            <Input
              id="monthlyPrice"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="nightlyPrice">Prix par nuit (MXN)</Label>
            <Input
              id="nightlyPrice"
              value={nightlyPrice}
              onChange={(e) => setNightlyPrice(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="salePrice">Prix de vente (MXN)</Label>
            <Input
              id="salePrice"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="deposit">Dépôt de garantie (MXN)</Label>
          <Input
            id="deposit"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="mt-2 w-48"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Vous pouvez ajouter le dépôt de garantie qui sera affiché dans
            l&apos;annonce.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default PricingPageClient;
