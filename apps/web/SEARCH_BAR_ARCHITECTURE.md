# Architecture de la Barre de Recherche

## Vue d'ensemble

Le système de recherche est maintenant unifié avec deux composants spécialisés selon le contexte :

- **`SearchBarDesktop`** : Page d'accueil et autres pages (navigation vers `/find`)
- **`SearchBarFind`** : Page `/find` (mise à jour en temps réel avec filtres)

## Structure des Composants

```
apps/web/
├── app/[locale]/(public)/
│   ├── layout.tsx                        # ✅ QueryProvider au niveau racine
│   └── find/
│       └── page.tsx                      # Page de recherche avec carte
├── components/
│   ├── layout/
│   │   └── Header.tsx                    # Header adaptatif selon la page
│   ├── search/
│   │   ├── SearchBarDesktop.tsx          # Barre home (navigate to /find)
│   │   ├── SearchBarFind.tsx             # Barre /find (live filters)
│   │   └── AdvancedFilters.tsx           # Panel de filtres avancés
│   └── property-search/
│       ├── MobileSearchBar.tsx           # Wrapper mobile pour /find
│       ├── PropertySidebar.tsx           # Liste de propriétés
│       └── PropertyMap.tsx               # Carte interactive
└── stores/
    └── search-store.ts                   # ⚠️ SINGLE SOURCE OF TRUTH
```

## Composants Clés

### 1. **SearchBarDesktop** (Page Home)

**Fichier** : `components/search/SearchBarDesktop.tsx`

**Usage** : Navigation depuis la page d'accueil vers `/find`

**Features** :

- 3 inputs : Type de bien, Lieu, Prix
- Bouton "Rechercher" qui navigue vers `/find?params`
- Pas de filtres avancés
- Support touche Enter

**Connexion Store** :

```typescript
const {
  listingType,
  location,
  minPrice,
  setListingType,
  setLocation,
  setPriceRange,
  toURLParams,
} = useSearchStore();
```

**Navigation** :

```typescript
const handleSearch = useCallback(() => {
  const params = toURLParams();
  router.push(`/find?${params.toString()}`);
}, [toURLParams, router]);
```

### 2. **SearchBarFind** (Page /find)

**Fichier** : `components/search/SearchBarFind.tsx`

**Usage** : Recherche en temps réel sur la page `/find`

**Features** :

- **Desktop** : Barre inline dans le header
  - 3 inputs + bouton Filtres
  - Modal (Dialog) pour les filtres avancés
  - Badge avec nombre de filtres actifs
- **Mobile** : Barre compacte au-dessus de la carte
  - 2 inputs (Type, Lieu) + bouton Filtres
  - Sheet (drawer bottom) pour les filtres
  - Badge compact avec nombre de filtres

**Filtres Avancés Accessibles** :

- Type de bien (Appartement, Maison, Villa, Studio)
- Fourchette de prix
- Nombre de chambres
- Nombre de salles de bain
- Surface (m²)
- Équipements (10 options)

**Comptage Filtres** :

```typescript
const activeFiltersCount =
  (propertyType ? 1 : 0) +
  (minBedrooms ? 1 : 0) +
  (minBathrooms ? 1 : 0) +
  amenities.length;
```

### 3. **Header** (Adaptatif)

**Fichier** : `components/layout/Header.tsx`

**Logic** : Détecte la page courante et affiche la bonne barre

```typescript
const pathname = usePathname();
const isFindPage = pathname?.includes('/find');

// Affiche SearchBarFind sur /find, SearchBarDesktop ailleurs
{isFindPage ? <SearchBarFind /> : <SearchBarDesktop />}
```

### 4. **MobileSearchBar** (Wrapper Mobile)

**Fichier** : `components/property-search/MobileSearchBar.tsx`

**Usage** : Affiche `SearchBarFind` fixe au-dessus de la carte sur mobile

```typescript
<div className="md:hidden fixed top-[69px] left-0 right-0 z-10 p-3">
  <SearchBarFind />
</div>
```

**Position** :

- `fixed` : Reste visible pendant le scroll
- `top-[69px]` : Sous le header (hauteur 69px)
- `z-10` : Au-dessus de la carte mais sous le header
- Gradient background pour meilleure lisibilité

### 5. **AdvancedFilters** (Panel Réutilisable)

**Fichier** : `components/search/AdvancedFilters.tsx`

**Props** :

```typescript
interface AdvancedFiltersProps {
  onClose?: () => void; // Callback pour fermer
  showHeader?: boolean; // Afficher header avec titre
  className?: string; // Classes custom
}
```

**Usage** :

```typescript
// Dans Dialog (Desktop)
<DialogContent className="max-w-2xl max-h-[90vh] p-0">
  <AdvancedFilters onClose={() => setIsFiltersOpen(false)} showHeader={true} />
</DialogContent>

// Dans Sheet (Mobile)
<SheetContent side="bottom" className="h-[90vh] p-0">
  <AdvancedFilters onClose={() => setIsFiltersOpen(false)} showHeader={true} />
</SheetContent>
```

## Architecture des Données

### Store Unifié (Zustand)

**Fichier** : `stores/search-store.ts`

**Principe** : ✅ **SINGLE SOURCE OF TRUTH**

Tous les composants lisent/écrivent dans le même store :

```typescript
export interface SearchState {
  // Core Search
  listingType: ListingType;
  location: string | null;
  latitude: number | null;
  longitude: number | null;

  // Filters
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: PropertyType;
  minBedrooms: number | null;
  minBathrooms: number | null;
  amenities: string[];

  // ... Actions
  setListingType: (type: ListingType) => void;
  setLocation: (location, lat, lng) => void;
  setPriceRange: (min, max) => void;
  // ...
}
```

### Synchronisation URL

**Bidirectionnelle** :

1. **URL → Store** : Au chargement de la page
2. **Store → URL** : À chaque changement de filtre

```typescript
// Dans la page /find
useEffect(() => {
  if (!hasInitializedRef.current) {
    setFiltersFromURL(searchParams);
    hasInitializedRef.current = true;
  }
}, [searchParams, setFiltersFromURL]);

useEffect(() => {
  if (!hasInitializedRef.current) return;

  const params = toURLParams();
  const newSearch = params.toString();

  if (newSearch !== currentSearch) {
    window.history.replaceState({}, '', `${pathname}?${newSearch}`);
  }
}, [listingType, minPrice, maxPrice, ...otherFilters, toURLParams]);
```

### React Query Provider

**Fichier** : `app/[locale]/(public)/layout.tsx`

**Architecture** : QueryProvider au niveau racine pour éviter duplication

```typescript
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Header />
      {children}
      <Footer />
    </QueryProvider>
  );
}
```

✅ **Avantages** :

- Un seul QueryClient pour toute l'app
- Cache partagé entre composants
- Pas de nested providers

## Performance et Optimisations

### 1. **Memoization**

```typescript
// ✅ useCallback pour event handlers
const handleLocationSelect = useCallback(
  (result: GeocodingResult) => {
    const locationName = result.display_name;
    setLocation(locationName, parseFloat(result.lat), parseFloat(result.lon));
  },
  [setLocation],
);

const handlePriceChange = useCallback(
  (value: string) => {
    setLocalPrice(value);
    const numValue = value ? parseFloat(value) : null;
    setPriceRange(numValue, null);
  },
  [setPriceRange],
);
```

### 2. **État Local pour Inputs**

```typescript
// ✅ Prix local pour éviter re-renders à chaque frappe
const [localPrice, setLocalPrice] = useState<string>(
  minPrice?.toString() || '',
);

// Sync avec store uniquement à la fin
const handlePriceChange = useCallback(
  (value: string) => {
    setLocalPrice(value); // Local first
    const numValue = value ? parseFloat(value) : null;
    setPriceRange(numValue, null); // Store after
  },
  [setPriceRange],
);
```

### 3. **Conditional Rendering**

```typescript
// ✅ useMediaQuery pour afficher desktop/mobile
const isDesktop = useMediaQuery('(min-width: 768px)');

if (isDesktop) {
  return <DesktopVersion />;
}

return <MobileVersion />;
```

### 4. **Debouncing Géocoding**

Le composant `LocationSearchBar` utilise déjà du debouncing (300ms) pour les appels API.

## Responsive Design

### Desktop (≥768px)

**Header** :

```
[Logo] ━━━━ [Type ▼] | [📍 Lieu...] | [💰 Prix] | [🎚️ Filtres (2)] ━━━━ [🌐][👤]
```

**Filtres** : Modal (Dialog) centrée, max-width 2xl

### Mobile (<768px)

**Au-dessus de la carte** :

```
┌─────────────────────────────────┐
│ [Type ▼] | [📍 Lieu...] [🎚️ 2] │
└─────────────────────────────────┘
```

**Filtres** : Sheet (drawer) depuis le bas, hauteur 90vh

## Principes Respectés ✅

### 1. **Single Source of Truth**

- ✅ Un seul store Zustand (`search-store.ts`)
- ❌ Pas de stores dupliqués ou états locaux non synchronisés

### 2. **Props-Based Reusability**

- ✅ `AdvancedFilters` réutilisable (Dialog/Sheet)
- ✅ `className` props pour customisation
- ✅ `onClose` callback pour contrôle parent

### 3. **Type Safety**

- ✅ TypeScript strict partout
- ✅ Pas de `any`
- ✅ Interfaces exportées du store

### 4. **Performance**

- ✅ `useCallback` pour handlers
- ✅ État local pour inputs
- ✅ `useMediaQuery` pour responsive
- ✅ QueryProvider au niveau racine

### 5. **Scalabilité**

- ✅ Composants modulaires
- ✅ Séparation Desktop/Mobile
- ✅ Filtres extensibles
- ✅ URL persistence

## Testing

### Component Tests

```typescript
it('should open filters modal on desktop', () => {
  render(<SearchBarFind />);

  const filtersButton = screen.getByLabelText('Filtres avancés');
  fireEvent.click(filtersButton);

  expect(screen.getByText('Type de bien')).toBeInTheDocument();
});

it('should update store when location is selected', () => {
  render(<SearchBarFind />);

  const result = { display_name: 'Paris', lat: '48.8566', lon: '2.3522' };
  const locationInput = screen.getByPlaceholderText('Ville, quartier...');

  fireEvent.change(locationInput, { target: { value: 'Paris' } });
  // Simulate geocoding result

  expect(useSearchStore.getState().location).toBe('Paris');
});
```

## Migration Guide

### Ancienne architecture → Nouvelle

❌ **Avant** :

```typescript
// Composants avec logique de recherche dupliquée
<ModernSearchBar />  // Home
<PropertySearchBar /> // /find
// Chacun gérait ses propres états
```

✅ **Après** :

```typescript
// Composants spécialisés mais store unifié
<SearchBarDesktop />  // Home → navigate to /find
<SearchBarFind />     // /find → live filters
// Les deux utilisent le même search-store.ts
```

## Troubleshooting

### Problem: "QueryClient not found"

**Solution** : Vérifier que `QueryProvider` est au niveau racine (`layout.tsx`)

### Problem: Filtres ne se ferment pas

**Solution** : Passer la prop `onClose` à `AdvancedFilters`

### Problem: URL pas synchronisée

**Solution** : Vérifier le `hasInitializedRef` pour éviter les boucles infinies

### Problem: Prix se réinitialise

**Solution** : Utiliser état local + sync avec store (pattern de `localPrice`)

## Futures Améliorations

### Phase 2 - À venir

- [ ] **Sauvegarde de recherches** : Favoris utilisateur
- [ ] **Historique de recherche** : Dernières recherches
- [ ] **Suggestions** : Autocomplete intelligent
- [ ] **Filtres rapides** : Presets populaires
- [ ] **Partage de recherche** : URL shareable avec tous les filtres

---

**Dernière mise à jour** : 30 novembre 2025  
**Version** : 2.0.0  
**Auteur** : Équipe Dev
