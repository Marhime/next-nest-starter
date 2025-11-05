import { cookies } from 'next/headers';
import { AboutPageClient } from './AboutPageClient';

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
    throw new Error('Failed to fetch property');
  }

  return res.json();
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId);

  return <AboutPageClient property={property} />;
}
