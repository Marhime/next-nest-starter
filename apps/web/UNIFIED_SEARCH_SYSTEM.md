# Système de Recherche Unifié

## Architecture Complète

Le système de recherche est maintenant **complètement unifié** avec un seul store Zustand qui gère:

- ✅ Les filtres de recherche
- ✅ Les propriétés (data)
- ✅ L'état de la carte
- ✅ La sélection/hover
- ✅ L'interface utilisateur
- ✅ La synchronisation URL bidirectionnelle

## Store Unifié: `search-store.ts`

### State Sections

```typescript
{
  // 1. FILTRES DE RECHERCHE
  listingType: 'SALE' | 'RENT' | 'SHORT_TERM' | null
  location: string | null
  latitude: number | null
  longitude: number | null
  minPrice: number | null
  maxPrice: number | null
  propertyType: 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA' | null
  minBedrooms: number | null
  maxBedrooms: number | null
  minBathrooms: number | null
  minArea: number | null
  maxArea: number | null
  amenities: string[]
  mapBounds: { north, south, east, west } | null

  // 2. DONNÉES PROPRIÉTÉS
  properties: Property[]
  isLoading: boolean
  error: Error | null

  // 3. ÉTAT CARTE
  mapCenter: [number, number]
  mapZoom: number

  // 4. SÉLECTION
  selectedPropertyId: number | null
  hoveredPropertyId: number | null

  // 5. UI
  isFiltersOpen: boolean
  sidebarWidth: number
  isSidebarCollapsed: boolean
}
```

## Flux de Données Unifié

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              UNIFIED SEARCH STORE (Zustand)                  │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐│
│  │   Filters   │  Properties │     Map     │      UI      ││
│  │   State     │    Data     │    State    │    State     ││
│  └─────────────┴─────────────┴─────────────┴──────────────┘│
└─────────────────────────────────────────────────────────────┘
         ↓                ↓                ↓
    ┌────────┐      ┌─────────┐     ┌──────────┐
    │  URL   │      │   API   │     │   Map    │
    │ Params │←─────│  Query  │────→│ Bounds   │
    └────────┘      └─────────┘     └──────────┘
```

## Synchronisation Bidirectionnelle Parfaite

### 1. URL → Store (au mount)

```typescript
// find/layout.tsx - useEffect #1
useEffect(() => {
  if (!hasInitializedRef.current) {
    setFiltersFromURL(searchParams); // Parse URL → Store

    // Center map if coords in URL
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      setMapCenter([parseFloat(lat), parseFloat(lng)]);
      setMapZoom(13);
    }

    hasInitializedRef.current = true;
  }
}, [searchParams]);
```

### 2. Store → URL (quand les filtres changent)

```typescript
// find/layout.tsx - useEffect #2
useEffect(() => {
  if (!hasInitializedRef.current) return; // Skip first render

  const params = toURLParams();
  const newSearch = params.toString();
  const currentSearch = window.location.search.replace('?', '');

  // Only update if URL actually changed (prevents loops)
  if (newSearch !== currentSearch) {
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }
}, [
  listingType,
  location,
  latitude,
  longitude,
  minPrice,
  maxPrice,
  propertyType,
  minBedrooms,
  maxBedrooms,
  minBathrooms,
  minArea,
  maxArea,
  amenities,
]);
```

**Protection contre les boucles infinies:**

- `hasInitializedRef` empêche la synchro URL→Store de se répéter
- Comparaison stricte `newSearch !== currentSearch` avant mise à jour
- Pas de dépendance sur `searchParams` dans le second useEffect

## React Query Integration

### Hook: `use-property-data.ts`

```typescript
export function usePropertyData() {
  const {
    setProperties,
    setLoading,
    setError,
    // Watch all filters
    listingType,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    minArea,
    maxArea,
    amenities,
    mapBounds,
  } = useSearchStore();

  // Build query params from store filters
  const queryParams = useMemo(
    () => ({
      listingType,
      minPrice,
      maxPrice, // ... tous les filtres
      mapBounds, // Pour nearby search
    }),
    [
      /* all filter deps */
    ],
  );

  const query = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => fetchProperties(queryParams),
    staleTime: 30 * 1000, // 30s
  });

  // Sync React Query → Store
  useEffect(() => {
    if (query.data) setProperties(query.data);
  }, [query.data, setProperties]);

  return query;
}
```

**Déclenchement automatique:**

- Quand un filtre change → `queryParams` change
- React Query détecte le nouveau `queryKey`
- Refetch automatique avec nouveaux params
- Store mis à jour → Composants re-render

## Composants Synchronisés

### PropertyMap

```typescript
export function PropertyMap() {
  const {
    mapCenter,
    mapZoom,
    properties,
    selectedPropertyId,
    selectProperty,
    isLoading,
  } = useSearchStore();

  // Map events → Store (debounced)
  const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useMapEvents({
    moveend: () => {
      setMapCenter([center.lat, center.lng]);

      // Debounce 500ms avant de mettre à jour bounds
      clearTimeout(boundsTimeoutRef.current);
      boundsTimeoutRef.current = setTimeout(() => {
        setMapBounds({ north, south, east, west });
      }, 500);
    },
  });
}
```

**Debouncing:**

- Évite trop de requêtes API pendant le drag de la carte
- 500ms de délai avant de mettre à jour `mapBounds`
- `mapBounds` → trigger React Query refetch

### PropertySidebar

```typescript
export function PropertySidebar() {
  const { properties, isLoading } = useSearchStore();

  // Properties are already filtered by API
  const filteredProperties = properties || [];

  return (
    <ScrollArea>
      {filteredProperties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </ScrollArea>
  );
}
```

**Pas de filtrage local:**

- Les filtres sont appliqués côté API
- Le sidebar affiche directement `properties` du store
- Optimisé pour les performances

### AdvancedFilters

```typescript
export function AdvancedFilters() {
  const {
    propertyType, minPrice, maxPrice,
    setPropertyType, setPriceRange, resetFilters
  } = useSearchStore();

  // Direct store binding
  return (
    <div>
      <Input
        value={minPrice || ''}
        onChange={(e) => setPriceRange(parseFloat(e.target.value), maxPrice)}
      />
      {/* ... autres filtres */}
    </div>
  );
}
```

**Two-way binding:**

- Input value = store state
- onChange = store setter
- Store change → URL update → API refetch

## Persistence

### LocalStorage (via Zustand persist)

```typescript
persist(
  (set, get) => ({
    /* store */
  }),
  {
    name: 'search-filters',
    partialize: (state) => ({
      // Only persist filters, not properties/loading/etc
      listingType: state.listingType,
      location: state.location,
      latitude: state.latitude,
      // ... other filters
    }),
  },
);
```

**Comportement:**

- Filtres sauvegardés dans localStorage
- Restaurés au prochain refresh
- URL prend priorité si présente

## Meilleures Pratiques Implémentées

### ✅ Single Source of Truth

- Un seul store pour tout le système
- Pas de duplication de state
- Synchronisation automatique entre composants

### ✅ URL as State

- Tous les filtres dans l'URL
- Partage de liens fonctionnel
- Bookmarks valides
- SEO-friendly

### ✅ Performance Optimizations

- Debouncing (500ms map bounds, 300ms geocoding)
- React Query caching (30s stale time)
- useMemo pour queryParams
- Persistence localStorage

### ✅ Type Safety

- TypeScript strict
- Interfaces complètes (Property, MapBounds, SearchFilters)
- Enums pour ListingType et PropertyType

### ✅ No Infinite Loops

- `hasInitializedRef` pour le mount
- Comparaison stricte avant mise à jour URL
- Deps explicites dans useEffect

## API Endpoints Utilisés

### 1. Recherche Globale

```
GET /properties?listingType=SALE&minPrice=100000&...
```

### 2. Recherche Nearby (avec map bounds)

```
GET /properties/nearby?north=48.9&south=48.8&east=2.4&west=2.3&...
```

**Logique:**

- Si `mapBounds` existe → `/properties/nearby`
- Sinon → `/properties`
- Les deux acceptent les mêmes query params de filtres

## Testing Strategy

### Unit Tests

```typescript
describe('useSearchStore', () => {
  it('should sync filters from URL params');
  it('should generate correct URL params');
  it('should reset filters properly');
});
```

### Integration Tests

```typescript
describe('Search Flow', () => {
  it('should update URL when filter changes');
  it('should trigger API call when filter changes');
  it('should update map when location changes');
});
```

### E2E Tests

```typescript
describe('Full Search Journey', () => {
  it('Home → /find navigation with filters');
  it('Apply filters → URL update → API call');
  it('Share URL → Correct filters restored');
});
```

## Migration Notes

**Ancien système:**

- ❌ Deux stores séparés (search-store + property-search-store)
- ❌ Filtres locaux dans PropertySidebar
- ❌ Hook use-nearby-properties séparé
- ❌ FloatingFilters component

**Nouveau système:**

- ✅ Un seul store unifié (search-store)
- ✅ Filtres appliqués par API
- ✅ use-property-data avec tous les filtres
- ✅ AdvancedFilters réutilisable

**Fichiers supprimés:**

- `stores/property-search-store.ts`
- `hooks/use-nearby-properties.ts`
- `components/property-search/FloatingFilters.tsx`

## Troubleshooting

### Les filtres ne se mettent pas à jour

→ Vérifier que le composant utilise bien `useSearchStore()` (pas le vieux store)

### Boucles infinies URL

→ Vérifier `hasInitializedRef` et comparaison `newSearch !== currentSearch`

### API ne refetch pas

→ Vérifier que les filtres sont bien dans les deps de `queryParams` (useMemo)

### Map bounds ne se mettent pas à jour

→ Vérifier le debounce de 500ms dans MapEventHandler

### Propriétés vides après filtrage

→ API retourne probablement un tableau vide → Vérifier les filtres backend

## Conclusion

Le système est maintenant **production-ready** avec:

- Architecture unifiée et scalable
- Synchronisation parfaite URL ↔ Store ↔ API ↔ Map
- Performance optimisée
- Type safety complète
- Pas de bugs de synchronisation
- Code maintenable et testable
