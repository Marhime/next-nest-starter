/**
 * Property Labels and Translations
 * Centralized labels for property types and listing types
 */

import type { ListingType, PropertyType } from '@/stores/search-store';

export const LISTING_TYPE_LABELS: Record<NonNullable<ListingType>, string> = {
  SALE: 'Vente',
  RENT: 'Location',
};

export const PROPERTY_TYPE_LABELS: Record<
  Exclude<PropertyType, null>,
  string
> = {
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  STUDIO: 'Studio',
  VILLA: 'Villa',
  LAND: 'Terrain',
  TOWNHOUSE: 'Maison de ville',
  DUPLEX: 'Duplex',
  PENTHOUSE: 'Penthouse',
  LOFT: 'Loft',
};

/**
 * Get translated listing type label
 */
export function getListingTypeLabel(type: string | undefined | null): string {
  if (!type) return '';
  return LISTING_TYPE_LABELS[type as NonNullable<ListingType>] || type;
}

/**
 * Get translated property type label
 */
export function getPropertyTypeLabel(type: string | undefined | null): string {
  if (!type) return '';
  return PROPERTY_TYPE_LABELS[type as Exclude<PropertyType, null>] || type;
}

/**
 * Get price label based on listing type
 * @param listingType - SALE or RENT
 * @returns Empty string for SALE, '/mois' for RENT
 */
export function getPriceLabel(listingType: string | undefined | null): string {
  if (listingType === 'RENT') return '/mois';
  return ''; // No suffix for SALE
}

/**
 * Get price placeholder based on listing type
 */
export function getPricePlaceholder(
  listingType: ListingType,
  isMin: boolean,
): string {
  if (listingType === 'SALE') {
    return isMin ? '100 000 €' : '500 000 €';
  }
  return isMin ? '500 €' : '2 000 €';
}

/**
 * Get budget label based on listing type
 */
export function getBudgetLabel(listingType: ListingType): string {
  return listingType === 'SALE' ? "Budget d'achat" : 'Budget mensuel';
}
