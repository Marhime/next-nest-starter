'use client';

import useSWRMutation from 'swr/mutation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'LAND'
  | 'HOTEL'
  | 'HOSTEL'
  | 'GUESTHOUSE'
  | 'ROOM';

interface CreatePropertyInput {
  propertyType: PropertyType;
}

interface Property {
  id: string;
  propertyType: PropertyType;
  createdAt: string;
  updatedAt: string;
}

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

  return response.json() as Promise<Property>;
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
