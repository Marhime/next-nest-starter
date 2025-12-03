# Architecture du Système de Recherche Unifié

## Vue d'ensemble

Le système de recherche utilise **un seul composant modal/drawer réutilisable** qui fonctionne sur toutes les pages avec le même état partagé.

## Composants Principaux

### 1. `SearchFiltersModal.tsx`

**Composant central réutilisable** qui adapte son affichage selon le device :

- **Mobile** : Drawer (bottom sheet)
- **Desktop** : Dialog (modal centré)

**Caractéristiques** :

- ✅ Un seul composant pour toutes les pages
- ✅ State synchronisé avec `search-store`
- ✅ Formulaire identique sur mobile et desktop
- ✅ Navigation automatique vers `/find` depuis la home page
- ✅ Refetch automatique si déjà sur `/find`

**Props** :

```typescript
interface SearchFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### 2. `SearchFiltersButton.tsx`

**Bouton trigger** qui ouvre `SearchFiltersModal`.

**Variants** :

- `compact` : Version mobile (barre de recherche compacte avec résumé des filtres)
- `default` : Bouton standard "Filtres" avec badge du nombre de filtres actifs
- `outline` : Bouton avec contour (utilisé dans le header)
- `secondary` : Bouton secondaire

**Usage** :

```tsx
// Page d'accueil - Mobile
<SearchFiltersButton variant="compact" />

// Page d'accueil - Desktop
<SearchFiltersButton variant="default" />

// Header sur /find - Desktop
<SearchFiltersButton variant="outline" className="bg-white" />
```

## Structure des Pages

### Page d'Accueil (`/`)

```tsx
// Mobile
<SearchFiltersButton variant="compact" />

// Desktop
<SearchFiltersButton variant="default" />
```

**Comportement** :

- Clic → Ouvre le modal/drawer
- Rechercher → Navigue vers `/find` avec les paramètres URL

### Page de Recherche (`/find`)

```tsx
// Mobile - Fixed en haut
<MobileSearchBar>
  <SearchFiltersButton variant="compact" />
</MobileSearchBar>

// Desktop - Dans le header
<Header>
  <SearchFiltersButton variant="outline" />
</Header>
```

**Comportement** :

- Clic → Ouvre le modal/drawer
- Rechercher → Ferme le modal, refetch automatique via `usePropertyData`

## Flux de Données

```
User Input
    ↓
SearchFiltersModal (local state)
    ↓
handleSearch() → Update store
    ↓
search-store (global state)
    ↓
usePropertyData hook (React Query)
    ↓
API /properties
    ↓
PropertyCard, PropertyMap, PropertySidebar
```

## State Management

### Local State (SearchFiltersModal)

- Inputs temporaires pendant l'édition
- Synchronisé avec le store à l'ouverture du modal
- Appliqué au store au clic sur "Rechercher"

### Global State (search-store)

- Single source of truth
- Persiste via Zustand persist middleware
- Génère les URL params via `toURLParams()`

## Best Practices Appliquées

### 1. DRY (Don't Repeat Yourself)

✅ Un seul composant modal au lieu de plusieurs copies  
✅ Réutilisable sur toutes les pages  
✅ State partagé via Zustand

### 2. Responsive Design

✅ Drawer sur mobile (better UX)  
✅ Dialog sur desktop (better UX)  
✅ Même contenu, UI adaptée

### 3. Performance

✅ React Query pour le caching  
✅ Refetch automatique sur changement de filtres  
✅ Local state pour éviter les re-renders inutiles

### 4. Accessibility

✅ Labels sémantiques  
✅ ARIA attributes  
✅ Keyboard navigation  
✅ Focus management

### 5. Type Safety

✅ TypeScript strict mode  
✅ Types partagés depuis `search-store`  
✅ Props interfaces bien définies

## Migration depuis l'ancien système

### Avant (Code dupliqué)

```
ModernSearchBar (home)
SearchBarDesktop (header)
SearchBarFind (find page)
MobileSearchBar (find mobile)
AdvancedFilters (drawer)
```

### Maintenant (Unifié)

```
SearchFiltersModal (seul composant modal/drawer)
SearchFiltersButton (triggers)
```

## Fichiers Concernés

### Nouveaux Composants

- `components/search/SearchFiltersModal.tsx` - Modal/Drawer unifié
- `components/search/SearchFiltersButton.tsx` - Bouton trigger

### Composants Mis à Jour

- `components/property-search/MobileSearchBar.tsx` - Utilise SearchFiltersButton
- `components/layout/Header.tsx` - Utilise SearchFiltersButton
- `app/[locale]/(public)/page.tsx` - Utilise SearchFiltersButton

### Composants Obsolètes (peuvent être supprimés)

- ~~`components/search/ModernSearchBar.tsx`~~
- ~~`components/search/SearchBarDesktop.tsx`~~
- ~~`components/search/SearchBarFind.tsx`~~
- ~~`components/search/AdvancedFilters.tsx`~~

## Exemple d'Utilisation

### Sur une nouvelle page

```tsx
'use client';

import { SearchFiltersButton } from '@/components/search/SearchFiltersButton';

export default function MyPage() {
  return (
    <div>
      <h1>Ma Page</h1>

      {/* Mobile */}
      <div className="md:hidden">
        <SearchFiltersButton variant="compact" />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <SearchFiltersButton variant="default" />
      </div>
    </div>
  );
}
```

## Notes Techniques

### Synchronisation State

Le modal synchronise son state local avec le store à chaque ouverture pour garantir la cohérence.

### Navigation Conditionnelle

```typescript
if (!pathname?.includes('/find')) {
  router.push(`/find?${params.toString()}`);
}
```

- Home page → Navigate vers /find
- Déjà sur /find → Reste sur place, refetch

### URL Params

Les filtres sont toujours synchronisés avec l'URL via `toURLParams()` pour permettre le partage de liens.

## Tests Recommandés

- [ ] Ouvrir le modal sur la home page (mobile + desktop)
- [ ] Modifier les filtres et rechercher → Navigue vers /find
- [ ] Ouvrir le modal sur /find (mobile + desktop)
- [ ] Modifier les filtres et rechercher → Reste sur /find, refetch
- [ ] Vérifier la synchronisation des filtres entre les pages
- [ ] Vérifier les URL params
- [ ] Tester la réactivité (resize window)
- [ ] Tester l'accessibilité (keyboard, screen reader)
