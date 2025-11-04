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
  return (
    <div className={className}>
      <h3 className="text-xl font-semibold mb-2">Confirmez votre adresse</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Votre adresse est uniquement communiquée aux voyageurs une fois leur
        réservation effectuée.
      </p>

      <div className="space-y-4">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Pays/Région</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => onChange('country', value)}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Sélectionnez un pays" />
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
          <Label htmlFor="buildingInfo">
            Bâtiment, appartement, résidence, étage (si applicable)
          </Label>
          <Input
            id="buildingInfo"
            type="text"
            value={formData.buildingInfo}
            onChange={(e) => onChange('buildingInfo', e.target.value)}
            placeholder="ex: Bâtiment A, Apt 203"
          />
        </div>

        {/* Building Name */}
        <div className="space-y-2">
          <Label htmlFor="buildingName">Nom du bâtiment (si applicable)</Label>
          <Input
            id="buildingName"
            type="text"
            value={formData.buildingName}
            onChange={(e) => onChange('buildingName', e.target.value)}
            placeholder="ex: Résidence du Parc"
          />
        </div>

        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="street">
            Numéro et libellé de voie <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            type="text"
            value={formData.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="ex: 123 Rue de la République"
            required
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Code postal <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="ex: 75001"
            required
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            Commune <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="ex: Paris"
            required
          />
        </div>

        {/* State/Region */}
        <div className="space-y-2">
          <Label htmlFor="state">Région/État</Label>
          <Input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="ex: Île-de-France"
          />
        </div>
      </div>
    </div>
  );
}
