# Système de Navigation du Formulaire de Propriété

## Vue d'ensemble

Le système de navigation connecte les boutons "Next" et "Back" du layout aux formulaires de chaque page. Les boutons sont désactivés tant que le formulaire n'est pas valide.

## Architecture

### Store Zustand (`store.ts`)

Le store gère trois états principaux :

- **`canProceed`** : Boolean indiquant si l'utilisateur peut avancer à l'étape suivante
- **`handleNext`** : Fonction optionnelle que le layout appelle quand l'utilisateur clique sur "Next"
- **`currentStep`** : Numéro de l'étape actuelle (0-4)

```typescript
type AddPropertyStore = {
  canProceed?: boolean;
  setCanProceed?: (canProceed: boolean) => void;
  handleNext?: () => void;
  setHandleNext?: (handler: (() => void) | undefined) => void;
  currentStep?: number;
  setCurrentStep: (step: number) => void;
};
```

### Layout (`layout.tsx`)

Le layout :

1. Lit `canProceed` et `handleNext` du store
2. Désactive le bouton "Next" si `canProceed` est `false` (sauf pour l'overview)
3. Appelle `handleNext()` quand l'utilisateur clique sur "Next"
4. Fallback vers navigation directe si pas de `handleNext`

```tsx
<Button
  onClick={(e) => {
    e.preventDefault();
    if (handleNext) {
      handleNext();
    } else {
      // Navigation directe
      router.push(nextUrl);
    }
  }}
  disabled={!canProceed && currentStep !== 0}
>
  {t('navigation.next')}
</Button>
```

### Pages de formulaire

Chaque page doit :

1. **Définir la validation** via `useEffect` qui met à jour `canProceed`
2. **Créer `handleSubmit` avec `useCallback`** pour la soumission
3. **Enregistrer le handler** dans le store via `setHandleNext`

#### Exemple : TypePage

```tsx
const TypePage = () => {
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHandleNext = useAddPropertyStore((state) => state.setHandleNext);

  // 1. Validation du formulaire
  useEffect(() => {
    const isValid =
      formData.propertyType !== undefined &&
      formData.listingType !== undefined &&
      // ... autres validations

      setCanProceed?.(isValid);
  }, [formData, setCanProceed]);

  // 2. Handler de soumission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Validation et soumission
      // ...
      router.push(`/hosting/${propertyId}/location`);
    },
    [formData, propertyId, router, mutate, t],
  );

  // 3. Enregistrement du handler
  useEffect(() => {
    setHandleNext?.(() => async () => {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      await handleSubmit(syntheticEvent);
    });

    return () => {
      setHandleNext?.(undefined);
    };
  }, [setHandleNext, handleSubmit]);
};
```

## Pages implémentées

### 1. Overview (`overview/page.tsx`)

- **Validation** : Toujours valide (`canProceed: true`)
- **Comportement** : Navigation directe (pas de `handleNext`)

### 2. Type (`type/page.tsx`)

- **Validation** :
  - `propertyType` défini
  - `listingType` défini
  - Prix approprié rempli selon le `listingType`
- **Comportement** : Soumet le formulaire et navigue vers `/location`

### 3. Location (`location/page.tsx`)

- **Validation** :
  - Phase = `'confirm'`
  - Coordonnées définies
- **Comportement** : Soumet l'adresse et navigue vers `/photos`

### 4. Photos (`photos/page.tsx`)

- **Validation** : Au moins 5 photos uploadées
- **Comportement** : Navigation directe (les photos sont sauvegardées au fur et à mesure)

### 5. About

- À implémenter

## Avantages

✅ **Validation temps réel** : Le bouton Next est désactivé tant que le formulaire n'est pas valide
✅ **UX cohérente** : Tous les boutons de navigation sont au même endroit
✅ **Soumission automatique** : Pas besoin de chercher le bouton Submit de chaque formulaire
✅ **Feedback immédiat** : L'utilisateur sait immédiatement si sa saisie est complète

## Debug

Pour débugger, ajouter des logs dans :

- La validation : `console.log('isValid:', isValid)`
- Le handler : `console.log('handleNext called')`
- Le store : `console.log('canProceed:', useAddPropertyStore.getState().canProceed)`
