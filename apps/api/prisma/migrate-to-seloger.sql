-- Script SQL pour convertir les données SHORT_TERM en SALE/RENT
-- À exécuter directement dans la base de données

-- 1. Mettre à jour les SHORT_TERM en RENT ou SALE (50/50)
UPDATE properties 
SET 
  listing_type = CASE 
    WHEN (id % 2) = 0 THEN 'SALE'::listing_type
    ELSE 'RENT'::listing_type
  END,
  sale_price = CASE 
    WHEN (id % 2) = 0 THEN nightly_price * 100
    ELSE NULL
  END,
  monthly_price = CASE 
    WHEN (id % 2) = 1 THEN nightly_price * 20
    ELSE NULL
  END,
  nightly_price = NULL
WHERE listing_type = 'SHORT_TERM';

-- 2. Vérifier le résultat
SELECT 
  listing_type, 
  COUNT(*) as count,
  AVG(CASE WHEN sale_price IS NOT NULL THEN sale_price::numeric ELSE NULL END) as avg_sale_price,
  AVG(CASE WHEN monthly_price IS NOT NULL THEN monthly_price::numeric ELSE NULL END) as avg_monthly_price
FROM properties 
GROUP BY listing_type;

-- 3. Mettre à jour le pays pour la France
UPDATE properties SET country = 'FR' WHERE country = 'MX';

-- 4. Afficher un échantillon
SELECT 
  id,
  property_type,
  listing_type,
  title,
  sale_price,
  monthly_price,
  city,
  bedrooms,
  bathrooms
FROM properties 
LIMIT 20;
