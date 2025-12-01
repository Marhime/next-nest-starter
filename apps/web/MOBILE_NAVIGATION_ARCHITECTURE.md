# Architecture de Navigation Mobile

## Vue d'ensemble

Le système de navigation mobile utilise une barre de tabs fixe en bas de l'écran, inspirée des applications natives iOS/Android, pour une expérience utilisateur optimale sur mobile.

## Structure des Composants

```
apps/web/
├── app/[locale]/(public)/
│   ├── layout.tsx                          # Layout avec padding mobile
│   ├── page.tsx                            # Page d'accueil
│   ├── find/page.tsx                       # Recherche de propriétés
│   ├── favorites/page.tsx                  # Favoris utilisateur
│   └── profile/page.tsx                    # Profil utilisateur
└── components/
    └── layout/
        ├── Header.tsx                      # Header desktop (masqué sur mobile)
        ├── Footer.tsx                      # Footer desktop uniquement
        └── MobileBottomNav.tsx             # Navigation mobile (tabs)
```

## Composant Principal : MobileBottomNav

**Fichier** : `components/layout/MobileBottomNav.tsx`

### Features

- ✅ **4 tabs principales** : Accueil, Recherche, Favoris, Profil
- ✅ **Fixed bottom** : Position fixe en bas de l'écran
- ✅ **Active state** : Indication visuelle de la page active
- ✅ **Icônes Lucide** : Icons cohérentes et scalables
- ✅ **Animations** : Scale sur l'icône active
- ✅ **Hauteur fixe** : 80px (h-20) pour cohérence

### Configuration des Tabs

```typescript
interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  exactMatch?: boolean; // true pour "/" uniquement
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    icon: Home,
    label: 'Accueil',
    exactMatch: true, // ✅ Match exact pour éviter conflits
  },
  {
    href: '/find',
    icon: Search,
    label: 'Recherche',
    exactMatch: false, // ✅ Inclut /find/property/123
  },
  {
    href: '/favorites',
    icon: Heart,
    label: 'Favoris',
    exactMatch: false,
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profil',
    exactMatch: false,
  },
];
```

### Détection de la Page Active

```typescript
const isActive = (href: string, exactMatch: boolean = false) => {
  if (exactMatch) {
    // Pour "/", compare exactement après suppression locale
    const cleanPath = pathname?.replace(/^\/[a-z]{2}/, '') || '/';
    return cleanPath === href || cleanPath === `${href}/`;
  }
  // Pour les autres, vérifie si le path contient le href
  return pathname?.includes(href);
};
```

### Design Responsive

```typescript
// ✅ Mobile uniquement
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
  {/* Tabs */}
</nav>

// ✅ État actif avec scale animation
<Icon className={cn(
  'h-6 w-6 transition-all',
  active && 'scale-110'
)} />
```

## Layout Configuration

**Fichier** : `app/[locale]/(public)/layout.tsx`

### Padding pour Navigation Mobile

```typescript
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Header />
      {/* ✅ Padding bottom sur mobile (80px) */}
      <div className="md:pb-0 pb-20">{children}</div>
      <Footer />
      <MobileBottomNav />
    </QueryProvider>
  );
}
```

### Constantes Exportées

```typescript
export const MOBILE_NAV_HEIGHT = 'pb-20'; // Tailwind class
export const MOBILE_NAV_HEIGHT_PX = 80; // Valeur en pixels
```

**Usage** : Si un composant a besoin de connaître la hauteur exacte pour des calculs.

## Pages Créées

### 1. Favorites Page

**Fichier** : `app/[locale]/(public)/favorites/page.tsx`

- Empty state avec icône Heart
- Message encourageant à explorer
- Prêt pour intégration avec système de favoris

### 2. Profile Page

**Fichier** : `app/[locale]/(public)/profile/page.tsx`

- Empty state avec icône User
- Message invitant à se connecter
- Prêt pour intégration avec Better Auth

## Comportements Responsive

### Mobile (<768px)

- ✅ **Header** : Simplifié ou masqué selon la page
- ✅ **Bottom Nav** : Visible et fixe (z-50)
- ✅ **Footer** : Masqué (`hidden md:block`)
- ✅ **Content** : Padding bottom de 80px

### Desktop (≥768px)

- ✅ **Header** : Complet avec recherche
- ✅ **Bottom Nav** : Masqué (`md:hidden`)
- ✅ **Footer** : Visible
- ✅ **Content** : Pas de padding bottom

## Z-Index Hierarchy

```
z-50  → MobileBottomNav (bottom nav)
z-20  → Header (top)
z-10  → MobileSearchBar (/find page)
z-2   → PropertyMap
```

## Cas Spécial : Page /find

La page `/find` utilise `min-h-screen` pour occuper tout l'écran :

```typescript
<div className="relative md:flex min-h-screen">
  {/* Content full-screen */}
</div>
```

Le padding du layout ne s'applique pas visuellement, mais la navigation reste au-dessus grâce au z-index.

## Accessibilité

### Keyboard Navigation

- ✅ Links natifs avec `<Link>` (next-intl)
- ✅ Tabulation naturelle entre les tabs
- ✅ Aria-labels implicites via text content

### Screen Readers

```tsx
<Link className="flex flex-col items-center..." href={item.href}>
  <Icon className="h-6 w-6" />
  <span className="text-xs">{item.label}</span> {/* ✅ Lisible */}
</Link>
```

### Touch Targets

- ✅ Hauteur minimum : 48px (h-full dans container h-20)
- ✅ Espacement horizontal adapté
- ✅ Hover states pour feedback

## Animations et Transitions

### Active State Animation

```typescript
<Icon
  className={cn(
    'h-6 w-6 transition-all',
    active && 'scale-110' // ✅ Légère emphase
  )}
/>
```

### Hover State

```typescript
className={cn(
  'hover:bg-muted/50 rounded-lg', // ✅ Feedback subtil
  active ? 'text-primary font-medium' : 'text-muted-foreground'
)}
```

## Personnalisation

### Ajouter un Tab

1. **Créer la page** dans `app/[locale]/(public)/`
2. **Ajouter dans NAV_ITEMS** :
   ```typescript
   {
     href: '/new-page',
     icon: IconName, // Import from lucide-react
     label: 'Label',
     exactMatch: false,
   }
   ```

### Changer les Icônes

```typescript
import { NewIcon } from 'lucide-react';

// Remplacer dans NAV_ITEMS
{ icon: NewIcon, ... }
```

### Ajuster la Hauteur

```typescript
// Dans MobileBottomNav.tsx
export const MOBILE_NAV_HEIGHT_PX = 64; // Par exemple

// Dans le composant
<div className="flex items-center justify-around h-16 px-2">
  {/* h-16 au lieu de h-20 */}
</div>

// Dans layout.tsx
<div className="md:pb-0 pb-16">{children}</div>
  {/* pb-16 au lieu de pb-20 */}
```

## Floating Action Button (Optionnel)

Le code inclut un FAB commenté pour ajouter des propriétés :

```typescript
<div className="md:hidden fixed bottom-24 right-4 z-50">
  <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
    <Link href="/properties/new">
      <Plus className="h-6 w-6" />
    </Link>
  </Button>
</div>
```

**Usage** : Décommenter si vous voulez un bouton flottant pour actions principales.

**Position** : `bottom-24` (96px) pour éviter chevauchement avec la nav.

## Performance

### Optimisations Appliquées

1. **Memoization** : `useCallback` pour `isActive` si nécessaire
2. **Client-side only** : `'use client'` directive
3. **Conditional rendering** : `md:hidden` évite le rendu desktop
4. **Pathname hook** : Utilise next-intl pour i18n

### Bundle Size

- **Composant** : ~2KB (minifié + gzipped)
- **Dépendances** : Lucide icons (tree-shakeable)
- **Impact** : Négligeable

## Testing

### Tests Recommandés

```typescript
describe('MobileBottomNav', () => {
  it('should highlight active tab', () => {
    render(<MobileBottomNav />);
    // Test active state
  });

  it('should navigate to correct page on click', () => {
    render(<MobileBottomNav />);
    const searchTab = screen.getByText('Recherche');
    fireEvent.click(searchTab);
    // Verify navigation
  });

  it('should hide on desktop', () => {
    render(<MobileBottomNav />);
    // Verify md:hidden class
  });
});
```

## Migration depuis l'Ancienne Navigation

### Avant

- ❌ Hamburger menu mobile
- ❌ Navigation dans le header uniquement
- ❌ Pas d'accès rapide aux sections principales

### Après

- ✅ Bottom tabs toujours visibles
- ✅ Navigation instantanée (4 taps maximum)
- ✅ UX native-like

## Principes Respectés ✅

### Architecture

- ✅ **Single Responsibility** : Un composant = une responsabilité
- ✅ **Separation of Concerns** : Layout vs Navigation vs Content
- ✅ **DRY** : Configuration centralisée des tabs

### Design

- ✅ **Mobile-first** : Pensé pour mobile, adapté pour desktop
- ✅ **Consistent spacing** : Padding uniforme (80px)
- ✅ **Visual feedback** : Active state + hover + animations

### Performance

- ✅ **Minimal re-renders** : Pathname hook optimisé
- ✅ **Tree-shaking** : Icons importées individuellement
- ✅ **CSS-only animations** : Pas de JS pour transitions

### Accessibilité

- ✅ **Semantic HTML** : `<nav>` + `<Link>`
- ✅ **Touch targets** : Taille minimum respectée
- ✅ **Screen reader friendly** : Labels visibles

## Troubleshooting

### Problem: Tab active ne s'affiche pas

**Solution** : Vérifier que `pathname` contient bien le locale prefix

### Problem: Chevauchement avec contenu

**Solution** : Vérifier le padding `pb-20` sur le container du layout

### Problem: Navigation ne fonctionne pas

**Solution** : Vérifier que les pages existent dans `app/[locale]/(public)/`

### Problem: Icônes ne s'affichent pas

**Solution** : Vérifier l'import depuis `lucide-react`

## Best Practices

### ✅ À Faire

- Limiter à 4-5 tabs maximum
- Utiliser des icônes reconnaissables
- Labels courts (max 10 caractères)
- Tester sur vrais devices (pas seulement DevTools)
- Garder le z-index cohérent

### ❌ À Éviter

- Plus de 5 tabs (surcharge cognitive)
- Icônes ambiguës
- Labels trop longs (débordement)
- Animations lourdes (lag sur low-end devices)
- Chevauchement avec autres éléments fixes

## Évolutions Futures

### Phase 2

- [ ] **Badges** : Notifications sur tabs (ex: 3 nouveaux favoris)
- [ ] **Haptic feedback** : Vibration au tap (mobile natif)
- [ ] **Swipe gestures** : Navigation par swipe entre tabs
- [ ] **Dark mode** : Thème adaptatif selon système

### Phase 3

- [ ] **Customisation utilisateur** : Réorganiser les tabs
- [ ] **Tab cachées** : Menu "Plus" pour > 5 sections
- [ ] **Progressive Web App** : Install prompt depuis tab

---

**Dernière mise à jour** : 30 novembre 2025  
**Version** : 1.0.0  
**Compatibilité** : iOS 12+, Android 5+, Modern browsers
