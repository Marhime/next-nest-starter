'use client';

import useSWR from 'swr';
import { ListingType } from './use-create-property';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Property {
  id: number;
  userId: string;
  propertyType: string;
  listingType?: string;
  title: string;
  description?: string;
  status: string;
  price?: string;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  photos: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  editToken?: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  return response.json();
};

export function useUserProperties() {
  const { data, error, isLoading, mutate } = useSWR<Property[]>(
    `${API_URL}/properties/user/me`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) {
    console.error('Error fetching user properties:', error);
  }

  return {
    properties: data || [],
    total: data?.length || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

type fetchPropertyType = {
  data: Property[];
};

export function useLatestProperties(listingType?: string) {
  const { data, error, isLoading, mutate } = useSWR<fetchPropertyType>(
    `${API_URL}/properties?limit=4${listingType ? `&listingType=${listingType}` : ''}`,
    fetcher,

    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) {
    console.error('Error fetching user properties:', error);
  }

  return {
    properties: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProperty(id: number | string) {
  const { data, error, isLoading, mutate } = useSWR<Property>(
    id ? `${API_URL}/properties/${id}` : null,
    fetcher,
  );

  return {
    property: data,
    isLoading,
    isError: error,
    mutate,
  };
}
