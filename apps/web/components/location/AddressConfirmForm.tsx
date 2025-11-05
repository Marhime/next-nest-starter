'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface AddressFormData {
  street: string;
  buildingInfo: string;
  buildingName: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
}

interface AddressConfirmFormProps {
  formData: AddressFormData;
  onChange: (field: keyof AddressFormData, value: string) => void;
  className?: string;
}

const countries = [
  { value: 'FR', label: 'France - FR' },
  { value: 'MX', label: 'México - MX' },
  { value: 'ES', label: 'España - ES' },
  { value: 'US', label: 'United States - US' },
  { value: 'CA', label: 'Canada - CA' },
];

export function AddressConfirmForm({
  formData,
  onChange,
  className,
}: AddressConfirmFormProps) {
  const t = useTranslations('LocationForm');

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold mb-2">{t('titles.form')}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t('descriptions.search')}
      </p>

      <div className="space-y-4">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">{t('labels.country')}</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => onChange('country', value)}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder={t('labels.country')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Building Info */}
        <div className="space-y-2">
          <Label htmlFor="buildingInfo">{t('labels.buildingInfo')}</Label>
          <Input
            id="buildingInfo"
            type="text"
            value={formData.buildingInfo}
            onChange={(e) => onChange('buildingInfo', e.target.value)}
          />
        </div>

        {/* Building Name */}
        <div className="space-y-2">
          <Label htmlFor="buildingName">{t('labels.buildingName')}</Label>
          <Input
            id="buildingName"
            type="text"
            value={formData.buildingName}
            onChange={(e) => onChange('buildingName', e.target.value)}
          />
        </div>

        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="street">
            {t('labels.street')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            type="text"
            value={formData.street}
            onChange={(e) => onChange('street', e.target.value)}
            required
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            {t('labels.postalCode')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            required
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            {t('labels.city')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            required
          />
        </div>

        {/* State/Region */}
        <div className="space-y-2">
          <Label htmlFor="state">{t('labels.state')}</Label>
          <Input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
