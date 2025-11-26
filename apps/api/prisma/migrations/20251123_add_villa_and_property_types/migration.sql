-- Add new PropertyType values
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'VILLA';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'TOWNHOUSE';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'DUPLEX';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'PENTHOUSE';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'STUDIO';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'LOFT';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'OFFICE';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'RETAIL';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'WAREHOUSE';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'BUILDING';

-- Add new ListingType value
ALTER TYPE "ListingType" ADD VALUE IF NOT EXISTS 'RENT';

-- Migrate existing data from LONG_TERM to RENT
UPDATE properties 
SET listing_type = 'RENT' 
WHERE listing_type = 'LONG_TERM';

-- Note: PostgreSQL doesn't support removing enum values easily
-- LONG_TERM will remain in the enum but won't be used
-- To fully remove it, we would need to recreate the enum which is risky
