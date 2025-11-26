/**
 * Property Search Store - Usage Examples
 * Exemples d'utilisation du store Zustand
 */

import { usePropertySearchStore } from '@/stores/property-search-store';

// ============================================
// EXEMPLE 1: Lecture de l'état
// ============================================

function ExampleReadState() {
  const { selectedPropertyId, sidebarWidth, searchQuery } = usePropertySearchStore();

  console.log('Propriété sélectionnée:', selectedPropertyId);
  console.log('Largeur sidebar:', sidebarWidth, '%');
  console.log('Recherche:', searchQuery);
}

// ============================================
// EXEMPLE 2: Modification de l'état
// ============================================

function ExampleUpdateState() {
  const { selectProperty, setSidebarWidth, setSearchQuery } = usePropertySearchStore();

  // Sélectionner une propriété
  const handleSelectProperty = (id: number) => {
    selectProperty(id);
  };

  // Changer la largeur de la sidebar
  const handleResize = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  // Mettre à jour la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
}

// ============================================
// EXEMPLE 3: Utilisation optimisée (sélecteurs)
// ============================================

// ❌ Mauvais: Tout le composant re-render quand n'importe quoi change
function BadExample() {
  const store = usePropertySearchStore();
  return <div>{store.searchQuery}</div>;
}

// ✅ Bon: Seulement re-render quand searchQuery change
function GoodExample() {
  const searchQuery = usePropertySearchStore((state) => state.searchQuery);
  return <div>{searchQuery}</div>;
}

// ============================================
// EXEMPLE 4: Actions multiples
// ============================================

function ExampleMultipleActions() {
  const { selectProperty, setMapCenter, setMapZoom } = usePropertySearchStore();

  const handlePropertySelect = (property: any) => {
    // Sélectionner la propriété
    selectProperty(property.id);

    // Centrer la carte sur la propriété
    if (property.latitude && property.longitude) {
      setMapCenter([property.latitude, property.longitude]);
      setMapZoom(15); // Zoom rapproché
    }
  };
}

// ============================================
// EXEMPLE 5: Filtres
// ============================================

function ExampleFilters() {
  const {
    setPriceRange,
    setPropertyTypes,
    setBedrooms,
    setBathrooms,
    resetFilters,
  } = usePropertySearchStore();

  const handleApplyFilters = () => {
    // Appliquer plusieurs filtres
    setPriceRange([100000, 500000]);
    setPropertyTypes(['Appartement', 'Maison']);
    setBedrooms(2);
    setBathrooms(1);
  };

  const handleClearFilters = () => {
    // Réinitialiser tous les filtres
    resetFilters();
  };
}

// ============================================
// EXEMPLE 6: Hover effects
// ============================================

function ExampleHoverEffects() {
  const { hoveredPropertyId, hoverProperty } = usePropertySearchStore();

  return (
    <div
      onMouseEnter={() => hoverProperty(123)}
      onMouseLeave={() => hoverProperty(null)}
      style={{
        opacity: hoveredPropertyId === 123 ? 1 : 0.7,
      }}
    >
      Propriété
    </div>
  );
}

// ============================================
// EXEMPLE 7: Sidebar toggle
// ============================================

function ExampleSidebarToggle() {
  const { isSidebarCollapsed, toggleSidebar } = usePropertySearchStore();

  return (
    <button onClick={toggleSidebar}>
      {isSidebarCollapsed ? 'Agrandir' : 'Réduire'} la sidebar
    </button>
  );
}

// ============================================
// EXEMPLE 8: Accès à l'état complet (debugging)
// ============================================

function ExampleFullState() {
  // Utiliser ceci seulement pour debugging
  // Cause des re-renders sur chaque changement
  const fullState = usePropertySearchStore();

  console.log('État complet:', fullState);
}

// ============================================
// EXEMPLE 9: Store en dehors des composants
// ============================================

import { usePropertySearchStore as getStore } from '@/stores/property-search-store';

// Accéder au store en dehors d'un composant React
function outsideComponent() {
  const store = getStore.getState();

  // Lire
  console.log(store.selectedPropertyId);

  // Écrire
  store.selectProperty(456);
}

// ============================================
// EXEMPLE 10: Store avec dérivations
// ============================================

function ExampleDerivedState() {
  // Créer un état dérivé
  const hasActiveFilters = usePropertySearchStore((state) => {
    return (
      state.searchQuery !== '' ||
      state.propertyTypes.length > 0 ||
      state.bedrooms !== null ||
      state.bathrooms !== null
    );
  });

  return (
    <div>
      {hasActiveFilters && <button>Effacer les filtres</button>}
    </div>
  );
}

// ============================================
// EXEMPLE 11: Integration avec React Query
// ============================================

import { useQuery } from '@tanstack/react-query';

function ExampleWithReactQuery() {
  const { mapBounds, searchQuery, propertyTypes } = usePropertySearchStore();

  // Les données se rechargent automatiquement quand les filtres changent
  const { data: properties } = useQuery({
    queryKey: ['properties', searchQuery, propertyTypes, mapBounds],
    queryFn: () => fetchProperties({ searchQuery, propertyTypes, mapBounds }),
  });

  return <div>{/* Afficher les propriétés */}</div>;
}

// ============================================
// EXEMPLE 12: Performance - useShallow
// ============================================

// Pour éviter les re-renders inutiles avec plusieurs valeurs
import { useShallow } from 'zustand/react/shallow';

function ExampleUseShallow() {
  const { searchQuery, selectedPropertyId } = usePropertySearchStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      selectedPropertyId: state.selectedPropertyId,
    }))
  );

  // Ne re-render que si searchQuery OU selectedPropertyId change
  // Pas de re-render si d'autres propriétés du store changent
}

export {};
