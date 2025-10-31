-- Update existing properties that are incomplete to DRAFT status
-- Properties are considered incomplete if they lack essential information

UPDATE "properties"
SET "status" = 'DRAFT'
WHERE "status" = 'ACTIVE'
AND (
  "title" IS NULL 
  OR "title" = '' 
  OR "title" = 'New House'
  OR "title" = 'New Apartment' 
  OR "title" = 'New Land'
  OR "description" IS NULL 
  OR "description" = ''
  OR (
    "monthly_price" IS NULL 
    AND "nightly_price" IS NULL 
    AND "sale_price" IS NULL
  )
  OR NOT EXISTS (
    SELECT 1 FROM "photos" 
    WHERE "photos"."property_id" = "properties"."id"
  )
);
