-- Migration script: Convert existing data to Mexican format
-- This script updates locations, coordinates, and pricing to match Puerto Escondido, Oaxaca
-- Run this after connecting to the database

-- 1. Update cities to Mexican cities (Puerto Escondido area)
UPDATE "Property"
SET 
  city = CASE 
    WHEN id % 10 = 0 THEN 'Puerto Escondido'
    WHEN id % 10 = 1 THEN 'Oaxaca de Juárez'
    WHEN id % 10 = 2 THEN 'Huatulco'
    WHEN id % 10 = 3 THEN 'Zipolite'
    WHEN id % 10 = 4 THEN 'Mazunte'
    WHEN id % 10 = 5 THEN 'San Agustinillo'
    WHEN id % 10 = 6 THEN 'Carrizalillo'
    WHEN id % 10 = 7 THEN 'La Punta'
    WHEN id % 10 = 8 THEN 'Zicatela'
    ELSE 'Bacocho'
  END,
  state = 'Oaxaca',
  country = 'MX';

-- 2. Update coordinates to Oaxaca Coast region (latitude: 15-16.5°N, longitude: -97 to -96°W)
UPDATE "Property"
SET 
  latitude = 15.5 + (RANDOM() * 1.0),  -- 15.5 to 16.5
  longitude = -97.0 + (RANDOM() * 1.0); -- -97 to -96

-- 3. Convert prices from EUR to MXN (multiply by ~20 for rough conversion)
-- RENT: 500-3000 EUR → 3000-25000 MXN
UPDATE "Property"
SET 
  "monthlyPrice" = "monthlyPrice" * 6.5
WHERE "listingType" = 'RENT' AND "monthlyPrice" IS NOT NULL;

-- 4. SALE: 80k-1.5M EUR → 800k-15M MXN
UPDATE "Property"
SET 
  "salePrice" = "salePrice" * 10
WHERE "listingType" = 'SALE' AND "salePrice" IS NOT NULL;

-- 5. Update currency to MXN
UPDATE "Property"
SET currency = 'MXN';

-- 6. Verify the changes
SELECT 
  city, 
  state, 
  country, 
  COUNT(*) as count,
  AVG(latitude) as avg_lat,
  AVG(longitude) as avg_lon
FROM "Property"
GROUP BY city, state, country
ORDER BY count DESC;

SELECT 
  "listingType",
  COUNT(*) as count,
  AVG("monthlyPrice") as avg_monthly,
  AVG("salePrice") as avg_sale,
  currency
FROM "Property"
GROUP BY "listingType", currency;
