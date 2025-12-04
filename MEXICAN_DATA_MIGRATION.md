# 🇲🇽 Migration vers données mexicaines

## Résumé des changements

Le système a été mis à jour pour refléter un site immobilier mexicain basé à **Puerto Escondido, Oaxaca**.

---

## ✅ Modifications effectuées

### 1. **Données de seed (seed.ts)**

#### Villes mexicaines

```typescript
const cities = [
  'Puerto Escondido', // Ville principale
  'Oaxaca de Juárez', // Capitale de l'état
  'Huatulco', // Station balnéaire
  'Zipolite', // Plage hippie
  'Mazunte', // Plage écologique
  'San Agustinillo', // Petite plage
  'Carrizalillo', // Plage populaire
  'La Punta', // Zone surf
  'Zicatela', // Plage de surf
  'Bacocho', // Zone résidentielle
];
```

#### Coordonnées géographiques

- **Latitude** : 15.0 - 16.5°N (Côte d'Oaxaca)
- **Longitude** : -97.0 à -96.0°W (Pacifique mexicain)

#### Prix en pesos mexicains (MXN)

- **Location mensuelle** : 3,000 - 25,000 MXN (~150 - 1,250 USD)
- **Vente** : 800,000 - 15,000,000 MXN (~40k - 750k USD)
- **Devise** : MXN (pesos mexicains)

---

### 2. **Traductions (es.json, en.json, fr.json)**

Nouveau namespace `SearchFilters` ajouté avec traductions complètes :

#### Espagnol (es.json) - Langue par défaut

```json
{
  "SearchFilters": {
    "lookingFor": "Busco",
    "buy": "Comprar",
    "rent": "Rentar",
    "locationPlaceholder": "Puerto Escondido, Oaxaca...",
    "budgetBuy": "Presupuesto de compra",
    "budgetRent": "Presupuesto mensual",
    "minPricePlaceholderBuy": "1,000,000 MXN",
    "maxPricePlaceholderBuy": "5,000,000 MXN",
    "minPricePlaceholderRent": "3,000 MXN",
    "maxPricePlaceholderRent": "20,000 MXN",
    "propertyTypes": {
      "APARTMENT": "Departamento",
      "HOUSE": "Casa",
      "LAND": "Terreno"
      // ... etc
    }
  }
}
```

#### Anglais (en.json)

- Traductions complètes avec terminologie immobilière anglaise
- Prix en MXN (Mexican pesos)

#### Français (fr.json)

- Traductions complètes pour les utilisateurs francophones
- Prix en MXN

---

### 3. **Composants internationalisés**

#### SearchFiltersModal.tsx

```tsx
// ✅ Avant (hardcodé en français)
<label>Je cherche à</label>
<Button>Acheter</Button>
<Button>Louer</Button>

// ✅ Après (internationalisé)
const t = useTranslations('SearchFilters');
<label>{t('lookingFor')}</label>
<Button>{t('buy')}</Button>
<Button>{t('rent')}</Button>
```

#### SearchFiltersButton.tsx

```tsx
// ✅ Avant
{
  location || 'Où allez-vous ?';
}
{
  listingType === 'SALE' ? 'Acheter' : 'Louer';
}

// ✅ Après
{
  location || t('whereGoing');
}
{
  listingType === 'SALE' ? t('buy') : t('rent');
}
```

---

## 📊 Données de test

### Ville : Puerto Escondido, Oaxaca

- **Population** : ~50,000 habitants
- **Climat** : Tropical, 28-32°C toute l'année
- **Économie** : Tourisme, surf, immobilier
- **Zones** : Zicatela (surf), La Punta (calme), Centro (ville), Carrizalillo (plage)

### Prix du marché (2025)

- **Studio** : 3,000 - 8,000 MXN/mois
- **Appartement 2 chambres** : 8,000 - 15,000 MXN/mois
- **Maison** : 12,000 - 25,000 MXN/mois
- **Terrain** : 800,000 - 5,000,000 MXN (selon taille et zone)
- **Villa** : 3,000,000 - 15,000,000 MXN

---

## 🚀 Comment appliquer les changements

### Option A : Re-seed (base vide)

```bash
cd apps/api
npm run seed
```

### Option B : Migration SQL (données existantes)

```bash
# Se connecter à PostgreSQL
psql -U postgres -d starter_next_nest

# Exécuter le script de migration
\i apps/api/prisma/migrate-to-mexican-data.sql
```

Le script `migrate-to-mexican-data.sql` fait :

1. ✅ Convertit toutes les villes en villes mexicaines (Puerto Escondido area)
2. ✅ Met à jour l'état en "Oaxaca" et le pays en "MX"
3. ✅ Ajuste les coordonnées (15-16.5°N, -97 to -96°W)
4. ✅ Convertit les prix EUR → MXN (×6.5 pour loyers, ×10 pour ventes)
5. ✅ Change la devise en MXN

---

## 🎯 Vérifications

### 1. Tester les traductions

```bash
cd apps/web
npm run dev
```

Visiter :

- `/` (espagnol par défaut)
- `/en` (anglais)
- `/fr` (français)

Cliquer sur "Filtres" → Vérifier que tout est traduit

### 2. Vérifier les prix

- **Location** : 3,000 - 25,000 MXN
- **Vente** : 800,000 - 15,000,000 MXN
- **Devise** : MXN (pas EUR)

### 3. Vérifier les villes

- Toutes les propriétés doivent être à Oaxaca, Mexique
- Villes : Puerto Escondido, Zipolite, Mazunte, etc.

### 4. Tester les filtres

- ✅ "Comprar" (Acheter) → Propriétés en VENTE uniquement
- ✅ "Rentar" (Louer) → Propriétés en LOCATION uniquement
- ✅ "Departamento" → Appartements uniquement
- ✅ "Terreno" → Terrains uniquement (pas de chambres/salles de bain)

---

## 🌍 Langues supportées

| Langue      | Locale | Status        | Notes                                           |
| ----------- | ------ | ------------- | ----------------------------------------------- |
| 🇲🇽 Espagnol | `es`   | ✅ Par défaut | Langue principale du site                       |
| 🇺🇸 Anglais  | `en`   | ✅ Complet    | Pour touristes/expats                           |
| 🇫🇷 Français | `fr`   | ✅ Complet    | Marché francophone important à Puerto Escondido |

---

## 📝 Types de propriétés (traduits)

| Type      | Español            | English   | Français        |
| --------- | ------------------ | --------- | --------------- |
| APARTMENT | Departamento       | Apartment | Appartement     |
| HOUSE     | Casa               | House     | Maison          |
| STUDIO    | Estudio            | Studio    | Studio          |
| VILLA     | Villa              | Villa     | Villa           |
| LAND      | Terreno            | Land      | Terrain         |
| TOWNHOUSE | Casa en condominio | Townhouse | Maison de ville |
| DUPLEX    | Dúplex             | Duplex    | Duplex          |
| PENTHOUSE | Penthouse          | Penthouse | Penthouse       |
| LOFT      | Loft               | Loft      | Loft            |

---

## 🔧 Prochaines étapes recommandées

### 1. Connecter la base de données

```bash
# Démarrer PostgreSQL
docker-compose up -d postgres

# Vérifier la connexion
cd apps/api
npm run db:push
```

### 2. Appliquer les données

```bash
# Option A : Seed complet (recommandé pour dev)
npm run seed

# Option B : Migration SQL (si données existantes)
psql -U postgres -d starter_next_nest -f prisma/migrate-to-mexican-data.sql
```

### 3. Tester le frontend

```bash
cd apps/web
npm run dev
```

Ouvrir http://localhost:3000 et tester :

- ✅ Changement de langue (es/en/fr)
- ✅ Filtres de recherche traduits
- ✅ Prix en MXN
- ✅ Villes mexicaines
- ✅ "Comprar" vs "Rentar" fonctionne

### 4. Nettoyage (optionnel)

Supprimer les vieux fichiers de migration française :

```bash
rm apps/api/prisma/migrate-to-seloger.sql
```

---

## 📚 Documentation des changements

### Fichiers modifiés

1. ✅ `apps/api/prisma/seed.ts` - Données mexicaines
2. ✅ `apps/web/messages/es.json` - Traductions espagnoles
3. ✅ `apps/web/messages/en.json` - Traductions anglaises
4. ✅ `apps/web/messages/fr.json` - Traductions françaises
5. ✅ `apps/web/components/search/SearchFiltersModal.tsx` - Internationalisé
6. ✅ `apps/web/components/search/SearchFiltersButton.tsx` - Internationalisé

### Fichiers créés

1. ✅ `apps/api/prisma/migrate-to-mexican-data.sql` - Script de migration
2. ✅ `MEXICAN_DATA_MIGRATION.md` - Cette documentation

### Standards respectés

- ✅ DRY : Pas de duplication, tout via `useTranslations`
- ✅ i18n : Toutes les langues supportées (es/en/fr)
- ✅ Type-safe : TypeScript strict mode
- ✅ Suivant les pratiques du projet (copilot-instructions.md)

---

## 🎉 Résultat final

Un site immobilier **100% mexicain** avec :

- 🌴 Données réalistes pour Puerto Escondido, Oaxaca
- 💰 Prix en pesos mexicains (MXN)
- 🌍 Interface multilingue (espagnol par défaut)
- 🎯 Filtres précis (Comprar/Rentar, types de propriétés)
- ♻️ Code DRY et maintenable

Le site est maintenant prêt pour le marché immobilier mexicain ! 🇲🇽
