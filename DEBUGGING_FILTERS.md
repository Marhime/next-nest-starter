# Guide de Débogage - Filtres de Recherche

## Problème Identifié

Les filtres (listingType, propertyType) ne semblent pas filtrer correctement les résultats.

## Logs Ajoutés

### Frontend (`use-property-data.ts`)

```
🔍 [usePropertyData] Active filters: {
  listingType, propertyType, priceRange, bedrooms, bathrooms
}
```

### Backend (`properties.service.ts`)

```
🔍 [findAll] Received filters: { propertyType, listingType, ... }
🔍 [findAll] Where clause: { ... }
```

## Tests à Effectuer

### 1. Tester la sélection de "Louer"

1. Ouvrir le modal de filtres
2. Cliquer sur "Louer"
3. Cliquer sur "Rechercher"
4. **Vérifier dans la console** :
   - `🔍 [usePropertyData] Active filters:` doit afficher `listingType: 'RENT'`
   - `🔍 [findAll] Received filters:` doit afficher `listingType: 'RENT'`
   - Les résultats doivent avoir `listingType === 'RENT'`

### 2. Tester la sélection de "Acheter"

1. Ouvrir le modal de filtres
2. Cliquer sur "Acheter"
3. Cliquer sur "Rechercher"
4. **Vérifier dans la console** :
   - `🔍 [usePropertyData] Active filters:` doit afficher `listingType: 'SALE'`
   - Les résultats doivent avoir `listingType === 'SALE'`

### 3. Tester les types de biens

1. Ouvrir le modal de filtres
2. Sélectionner "Terrain" dans le dropdown
3. Cliquer sur "Rechercher"
4. **Vérifier dans la console** :
   - `🔍 [usePropertyData] Active filters:` doit afficher `propertyType: 'LAND'`
   - Les résultats doivent avoir `propertyType === 'LAND'`
   - Les filtres "Chambres/SDB" ne doivent PAS apparaître

### 4. Tester les types de biens résidentiels

1. Ouvrir le modal de filtres
2. Sélectionner "Appartement"
3. Sélectionner "2+ chambres"
4. Cliquer sur "Rechercher"
5. **Vérifier dans la console** :
   - `🔍 [usePropertyData] Active filters:` doit afficher :
     - `propertyType: 'APARTMENT'`
     - `bedrooms: 2`
   - Les résultats doivent avoir `propertyType === 'APARTMENT'` ET `bedrooms >= 2`

## Problèmes Potentiels

### 1. Données de Test

Si les données de test ont été créées avec `SHORT_TERM`, elles ne correspondent plus aux filtres SALE/RENT.

**Solution** : Exécuter le script SQL `/apps/api/prisma/migrate-to-seloger.sql`

### 2. Store Non Synchronisé

Si le store n'est pas mis à jour après le clic sur "Rechercher".

**Vérifier** :

```typescript
// Dans SearchFiltersModal.tsx, handleSearch()
setListingType(selectedType); // ✅ Doit être appelé
setPropertyType(selectedPropertyType); // ✅ Doit être appelé
```

### 3. Backend Ne Reçoit Pas les Filtres

Si les query params ne sont pas envoyés dans la requête HTTP.

**Vérifier** :

```typescript
// Dans use-property-data.ts, fetchPropertiesPaginated()
if (params.listingType) queryParams.set('listingType', params.listingType); // ✅
if (params.propertyType) queryParams.set('propertyType', params.propertyType); // ✅
```

## Résultat Attendu

Après les corrections :

- ✅ Cliquer sur "Louer" → Affiche uniquement les biens en location (RENT)
- ✅ Cliquer sur "Acheter" → Affiche uniquement les biens à vendre (SALE)
- ✅ Sélectionner "Terrain" → Affiche uniquement les terrains (LAND), cache chambres/SDB
- ✅ Sélectionner "Appartement" + "2+ chambres" → Affiche appartements avec au moins 2 chambres

## Prochaines Étapes

1. **Exécuter l'app** : `npm run dev` (frontend + backend)
2. **Ouvrir le navigateur** avec la console ouverte (F12)
3. **Effectuer les tests** ci-dessus
4. **Noter les logs** dans la console
5. **Rapporter les résultats** pour diagnostic

Si les logs montrent que les filtres sont bien envoyés mais que les résultats ne correspondent pas, le problème vient des **données de test** qui ont `listingType = 'SHORT_TERM'` au lieu de `'SALE'` ou `'RENT'`.
