'use server';

import { requireAuth } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * Helper pour faire des requêtes authentifiées vers l'API NestJS
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const session = await requireAuth();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Transférer le cookie de session pour l'authentification
      Cookie: `better-auth.session_token=${session.session.token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * 📋 Récupérer tous les biens immobiliers
 */
export async function getProperties() {
  try {
    const properties = await fetchAPI('/properties');
    return { success: true, data: properties };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch properties',
    };
  }
}

/**
 * 📄 Récupérer un bien immobilier par ID
 */
export async function getProperty(id: string) {
  try {
    const property = await fetchAPI(`/properties/${id}`);
    return { success: true, data: property };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch property',
    };
  }
}

/**
 * ➕ Créer un nouveau bien immobilier
 */
export async function createProperty(formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      address: formData.get('address') as string,
      surface: parseFloat(formData.get('surface') as string),
    };

    const property = await fetchAPI('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Revalider la page pour afficher les nouvelles données
    revalidatePath('/dashboard/properties');

    return { success: true, data: property };
  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create property',
    };
  }
}

/**
 * ✏️ Mettre à jour un bien immobilier
 */
export async function updateProperty(id: string, formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      address: formData.get('address') as string,
      surface: parseFloat(formData.get('surface') as string),
    };

    const property = await fetchAPI(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    revalidatePath('/dashboard/properties');
    revalidatePath(`/dashboard/properties/${id}`);

    return { success: true, data: property };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update property',
    };
  }
}

/**
 * 🗑️ Supprimer un bien immobilier
 */
export async function deleteProperty(id: string) {
  try {
    await fetchAPI(`/properties/${id}`, {
      method: 'DELETE',
    });

    revalidatePath('/dashboard/properties');

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete property',
    };
  }
}
