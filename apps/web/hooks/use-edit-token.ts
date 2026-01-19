import { useAddPropertyStore } from '@/app/[locale]/hosting/store';

/**
 * Hook pour gérer le token d'édition anonyme
 * Utilise sessionStorage via Zustand au lieu de localStorage
 */
export function useEditToken(propertyId: number | string | undefined) {
  const setEditTokenInStore = useAddPropertyStore(
    (state) => state.setEditToken,
  );
  const getEditTokenFromStore = useAddPropertyStore(
    (state) => state.getEditToken,
  );
  const clearEditTokenFromStore = useAddPropertyStore(
    (state) => state.clearEditToken,
  );

  const propId = propertyId
    ? typeof propertyId === 'string'
      ? parseInt(propertyId)
      : propertyId
    : undefined;

  const getToken = (): string | undefined => {
    if (!propId) return undefined;
    return getEditTokenFromStore(propId);
  };

  const setToken = (token: string) => {
    if (!propId) return;
    setEditTokenInStore(propId, token);
  };

  const clearToken = () => {
    if (!propId) return;
    clearEditTokenFromStore(propId);
  };

  return { getToken, setToken, clearToken, token: getToken() };
}
