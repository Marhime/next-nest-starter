#!/bin/bash

# Script de migration des indexes de performance
# À exécuter après avoir mis à jour schema.prisma

set -e

echo "🚀 Migration des indexes de performance..."
echo ""

cd "$(dirname "$0")/.."

echo "📦 Génération de la migration Prisma..."
npx prisma migrate dev --name add_performance_indexes

echo ""
echo "✅ Migration des indexes terminée!"
echo ""
echo "📊 Nouveaux indexes créés:"
echo "  - propertyType"
echo "  - listingType"
echo "  - city, state, status"
echo "  - monthlyPrice, nightlyPrice, salePrice"
echo "  - bedrooms, bathrooms, area"
echo "  - latitude + longitude (GEO INDEX 🔥)"
echo "  - userId, createdAt"
echo ""
echo "🎯 Prochaines étapes:"
echo "  1. Tester les requêtes: npm run test:e2e"
echo "  2. Vérifier les logs de performance"
echo "  3. Monitorer avec: EXPLAIN ANALYZE SELECT..."
echo ""
