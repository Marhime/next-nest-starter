'use client';

import useSWRMutation from 'swr/mutation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND';
export type ListingType = 'SALE' | 'RENT';

interface CreatePropertyInput {
  propertyType: PropertyType;
  listingType?: 'RENT' | 'SALE';
  phone?: string;
}

// Response shape may be either { id, propertyType, ... } or { property: { ... }, editToken: string }

async function createProperty(
  url: string,
  { arg }: { arg: CreatePropertyInput },
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Return raw parsed JSON. The backend may return either { property } or { property, editToken }
  return response.json() as Promise<Record<string, unknown>>;
}

export function useCreateProperty() {
  const { trigger, isMutating, error } = useSWRMutation(
    `${API_URL}/properties`,
    createProperty,
  );

  return {
    createProperty: trigger,
    isCreating: isMutating,
    error,
  };
}
