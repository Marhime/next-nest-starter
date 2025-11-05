'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAddPropertyStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bed,
  Bath,
  Users,
  Building2,
  Home,
  Wifi,
  Car,
  Waves,
  Snowflake,
  Tv,
  UtensilsCrossed,
  Minus,
  Plus,
  Maximize2,
  CheckCircle2,
  ChevronRight,
  Heater,
  Wind,
  Fence,
  Dog,
  Trees,
  Sofa,
  Dumbbell,
  Shield,
  Shirt,
  DoorOpen,
  Sparkles,
  Sun,
  Refrigerator,
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  floor?: number;
  area?: number;
  amenities?: string[];
  status: string;
  propertyType: string;
  listingType?: string;
}

interface AboutPageClientProps {
  property: Property;
}

// Liste des équipements disponibles style SeLoger Mexique
const AVAILABLE_AMENITIES = [
  // Essentiels
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'air_conditioning', label: 'Climatisation', icon: Snowflake },
  { id: 'heating', label: 'Chauffage', icon: Heater },
  { id: 'kitchen', label: 'Cuisine équipée', icon: UtensilsCrossed },

  // Électroménager
  { id: 'tv', label: 'Télévision', icon: Tv },
  { id: 'refrigerator', label: 'Réfrigérateur', icon: Refrigerator },
  { id: 'washing_machine', label: 'Machine à laver', icon: Shirt },

  // Extérieur & Parking
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'garage', label: 'Garage', icon: DoorOpen },
  { id: 'garden', label: 'Jardin', icon: Trees },
  { id: 'balcony', label: 'Balcon', icon: Sun },
  { id: 'terrace', label: 'Terrasse', icon: Fence },

  // Luxe & Loisirs
  { id: 'pool', label: 'Piscine', icon: Waves },
  { id: 'gym', label: 'Salle de sport', icon: Dumbbell },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: Waves },

  // Sécurité & Services
  { id: 'security', label: 'Sécurité 24h', icon: Shield },
  { id: 'doorman', label: 'Portier', icon: Shield },
  { id: 'elevator', label: 'Ascenseur', icon: Building2 },
  { id: 'furnished', label: 'Meublé', icon: Sofa },

  // Extras
  { id: 'pets_allowed', label: 'Animaux acceptés', icon: Dog },
  { id: 'cleaning_service', label: 'Service de ménage', icon: Sparkles },
  { id: 'ventilator', label: 'Ventilateurs', icon: Wind },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon', color: 'bg-gray-500' },
  { value: 'ACTIVE', label: 'Actif', color: 'bg-green-500' },
  { value: 'INACTIVE', label: 'Inactif', color: 'bg-yellow-500' },
  { value: 'RENTED', label: 'Loué', color: 'bg-blue-500' },
  { value: 'SOLD', label: 'Vendu', color: 'bg-purple-500' },
];

export function AboutPageClient({ property }: AboutPageClientProps) {
  const router = useRouter();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);

  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    capacity: property.capacity || 1,
    floor: property.floor || 0,
    area: property.area || 0,
    amenities: property.amenities || [],
    status: property.status || 'DRAFT',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  // Validation: all required fields
  useEffect(() => {
    const isValid =
      formData.title.trim().length > 0 &&
      formData.description &&
      formData.description.trim().length > 0 &&
      formData.bedrooms > 0 &&
      formData.bathrooms > 0;

    setCanProceed?.(isValid as boolean);
  }, [formData, setCanProceed]);

  // Save and publish handler
  const handleSave = useCallback(async () => {
    try {
      // Save all changes and set status to ACTIVE to publish
      const dataToSave = {
        ...formData,
        status: 'ACTIVE', // Force publication
      };

      const response = await fetch(`${API_URL}/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Échec de la publication');
      }

      toast.success('🎉 Annonce publiée avec succès !');

      // Redirect to public property page
      setTimeout(() => {
        router.push(`/property/${property.id}`);
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la publication',
      );
      throw error;
    }
  }, [API_URL, property.id, formData, router]);

  // Configure navigation
  useEffect(() => {
    setHandleNext?.(handleSave);
    return () => setHandleNext?.(undefined);
  }, [handleSave, setHandleNext]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const incrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || 0) + 1,
    }));
  };

  const decrementValue = (
    field: 'bedrooms' | 'bathrooms' | 'capacity' | 'floor',
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) - 1),
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities || [];
      const hasAmenity = amenities.includes(amenityId);

      return {
        ...prev,
        amenities: hasAmenity
          ? amenities.filter((a) => a !== amenityId)
          : [...amenities, amenityId],
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Finalisez votre annonce</h1>
        <p className="text-muted-foreground text-lg">
          Vérifiez et complétez les informations de votre bien
        </p>
      </div>

      {/* Title & Description */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                Titre de l&apos;annonce *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ex: Bel appartement lumineux avec vue"
                className="mt-2 text-base h-12"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Décrivez votre bien en détail..."
                className="mt-2 min-h-[150px] text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.description?.length || 0} caractères
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Area */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Surface</h2>
        <div className="flex items-center gap-4">
          <Maximize2 className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1">
            <Label htmlFor="area" className="text-base font-medium">
              Surface habitable (m²)
            </Label>
            <Input
              id="area"
              type="number"
              value={formData.area || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateField('area', value === '' ? 0 : parseFloat(value));
              }}
              placeholder="Ex: 85"
              className="mt-2 text-base h-12"
              min="0"
              step="1"
            />
          </div>
        </div>
      </Card>

      {/* Bedrooms - Airbnb Style */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bed className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Chambres</p>
              <p className="text-sm text-muted-foreground">
                Nombre de chambres à coucher
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => decrementValue('bedrooms')}
              disabled={formData.bedrooms <= 0}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-semibold w-12 text-center">
              {formData.bedrooms}
            </span>
            <button
              onClick={() => incrementValue('bedrooms')}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Bathrooms - Airbnb Style */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bath className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Salles de bain</p>
              <p className="text-sm text-muted-foreground">
                Nombre de salles de bain complètes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => decrementValue('bathrooms')}
              disabled={formData.bathrooms <= 0}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-semibold w-12 text-center">
              {formData.bathrooms}
            </span>
            <button
              onClick={() => incrementValue('bathrooms')}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Capacity - Airbnb Style */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Capacité d&apos;accueil</p>
              <p className="text-sm text-muted-foreground">
                Nombre de personnes maximum
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => decrementValue('capacity')}
              disabled={formData.capacity <= 1}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-semibold w-12 text-center">
              {formData.capacity}
            </span>
            <button
              onClick={() => incrementValue('capacity')}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Floor - Airbnb Style */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Étage</p>
              <p className="text-sm text-muted-foreground">
                Numéro de l&apos;étage (0 = rez-de-chaussée)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => decrementValue('floor')}
              disabled={formData.floor <= 0}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-semibold w-12 text-center">
              {formData.floor}
            </span>
            <button
              onClick={() => incrementValue('floor')}
              className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Amenities */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Équipements</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez tous les équipements disponibles dans votre bien
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AVAILABLE_AMENITIES.map((amenity) => {
            const Icon = amenity.icon;
            const isSelected = formData.amenities?.includes(amenity.id);

            return (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div
                  className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-600'}`}
                  />
                </div>
                <span className="flex-1 text-sm font-medium">
                  {amenity.label}
                </span>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Statut de l&apos;annonce</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {STATUS_OPTIONS.map((status) => {
            const isSelected = formData.status === status.value;

            return (
              <button
                key={status.value}
                onClick={() => updateField('status', status.value)}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div
                  className={`w-3 h-3 rounded-full ${isSelected ? status.color : 'bg-gray-300'}`}
                />
                <span className="font-medium">{status.label}</span>
                {isSelected && <ChevronRight className="h-4 w-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Récapitulatif</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Titre:</strong> {formData.title || 'Non défini'}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {formData.description
                  ? `${formData.description.substring(0, 100)}...`
                  : 'Non défini'}
              </p>
              <p>
                <strong>Caractéristiques:</strong> {formData.bedrooms} chambre
                {formData.bedrooms > 1 ? 's' : ''} · {formData.bathrooms} salle
                {formData.bathrooms > 1 ? 's' : ''} de bain ·{' '}
                {formData.capacity} personne{formData.capacity > 1 ? 's' : ''}
                {formData.area > 0 && ` · ${formData.area} m²`}
              </p>
              <p>
                <strong>Équipements:</strong> {formData.amenities?.length || 0}{' '}
                sélectionné
                {(formData.amenities?.length || 0) > 1 ? 's' : ''}
              </p>
              <p>
                <strong>Statut:</strong>{' '}
                <Badge
                  className={
                    STATUS_OPTIONS.find((s) => s.value === formData.status)
                      ?.color
                  }
                >
                  {
                    STATUS_OPTIONS.find((s) => s.value === formData.status)
                      ?.label
                  }
                </Badge>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
