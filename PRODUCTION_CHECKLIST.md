# ✅ Checklist: Mise en Production

## 🚀 Actions Immédiates (Avant déploiement)

### 1. Migrer les indexes database (10 min)

```bash
cd apps/api
chmod +x scripts/migrate-indexes.sh
./scripts/migrate-indexes.sh
```

**Pourquoi?** Amélioration de **10-100x** sur les requêtes géographiques

---

### 2. Vérifier les variables d'environnement

**Frontend** (`apps/web/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
NEXT_PUBLIC_CDN_URL=https://cdn.votredomaine.com
```

**Backend** (`apps/api/.env.production`)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
NODE_ENV=production
CORS_ORIGIN=https://votredomaine.com
```

---

### 3. Ajouter Compression HTTP (5 min)

```bash
cd apps/api
npm install compression
```

```typescript
// apps/api/src/main.ts
import compression from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression()); // ✅ Ajouter cette ligne
  // ...
}
```

---

### 4. Ajouter Helmet (sécurité) (5 min)

```bash
cd apps/api
npm install helmet
```

```typescript
// apps/api/src/main.ts
import helmet from 'helmet';

app.use(helmet()); // ✅ Ajouter avant CORS
```

---

## ⏳ Actions Recommandées (Post-déploiement)

### 5. Setup CDN pour images (1-2h)

**Option A: Cloudflare Images** (Recommandé)

- $5/mois pour 100k images
- Setup: https://dash.cloudflare.com/images

**Option B: AWS CloudFront**

- Pay-as-you-go
- Plus complexe mais plus flexible

**Modification code**:

```typescript
// apps/web/lib/utils.ts
export function getPhotoUrl(url: string): string {
  if (url.startsWith('http')) return url;

  const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${CDN_URL}/properties/${url}?w=800&q=75&format=webp`;
}
```

---

### 6. Setup Redis Cache (1-2h)

**Provider**: Upstash (serverless) ou Redis Cloud

- $10/mois pour 10GB
- Setup: https://upstash.com

```bash
cd apps/api
npm install @nestjs/cache-manager cache-manager-redis-store
```

```typescript
// apps/api/src/app.module.ts
CacheModule.register({
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: 6379,
  ttl: 60,
});
```

**Impact**: -80% de charge database

---

### 7. Setup Monitoring (30 min)

**Sentry** (Errors + Performance)

```bash
npm install @sentry/nextjs @sentry/nestjs
```

**Frontend**: `apps/web/sentry.client.config.ts`
**Backend**: `apps/api/src/main.ts`

**Gratuit** jusqu'à 5k events/mois

---

## 📊 Tests de Performance

### Avant déploiement

1. **Load Testing** (k6)

   ```bash
   k6 run tests/load-test.js
   ```

   Cible: **500 req/s** sans erreur

2. **Lighthouse Score** (Frontend)
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

3. **Database Queries**

   ```sql
   -- Vérifier les indexes
   EXPLAIN ANALYZE SELECT * FROM properties
   WHERE latitude BETWEEN 45.0 AND 46.0
   AND longitude BETWEEN -1.0 AND 0.0;

   -- Doit utiliser "Index Scan" (pas "Seq Scan")
   ```

---

## 🎯 Métriques à Surveiller

### Jour 1-7 (Post-launch)

- ✅ Taux d'erreur < 0.1%
- ✅ Response time P95 < 200ms
- ✅ Database CPU < 70%
- ✅ Memory usage < 80%

### Semaine 2+

- Cache hit rate > 70% (Redis)
- CDN cache hit rate > 90%
- Coût infrastructure vs prévisions

---

## 🚨 Troubleshooting

### Problème: "Too many requests"

**Solution**: Rate limit trop strict

```typescript
// apps/api/src/common/guards/rate-limit.guard.ts
private readonly maxRequests = 200; // Augmenter de 100 à 200
```

### Problème: "Slow database queries"

**Solution**: Vérifier les indexes

```bash
cd apps/api
npx prisma studio
# Ouvrir PostgreSQL logs
```

### Problème: "Out of memory"

**Solution**: Connection pool trop grand

```env
DATABASE_URL="...?connection_limit=10" # Réduire de 20 à 10
```

---

## 📞 Support

- **Documentation**: `/OPTIMIZATION_REPORT.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Validation Finale

Avant de déployer en production, vérifier:

- [ ] Migration indexes exécutée
- [ ] Variables d'environnement configurées
- [ ] Compression HTTP activée
- [ ] Helmet (sécurité) activé
- [ ] Tests de charge passés
- [ ] Monitoring configuré (Sentry)
- [ ] CDN configuré (optionnel mais recommandé)
- [ ] Redis cache configuré (optionnel)
- [ ] Backup database configuré

**Temps total estimé**: 2-4 heures

🚀 **Votre application est maintenant prête pour production!**
