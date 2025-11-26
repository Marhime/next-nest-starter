/**
 * Modern Property Details Page (PDP)
 * Server Component - Fetches data and renders client component
 */

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PropertyDetailsClient from './PropertyDetailsClient';

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Property {
  id: number;
  title: string;
  description?: string;
  propertyType: string;
  listingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  floor?: number;
  area?: number;
  amenities?: string[];
  status: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  monthlyPrice?: string;
  nightlyPrice?: string;
  salePrice?: string;
  currency?: string;
  photos: Photo[];
  user?: User;
}

async function getProperty(propertyId: string): Promise<Property> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/properties/${propertyId}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  return <PropertyDetailsClient property={property} />;
}
