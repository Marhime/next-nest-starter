-- Change default value from ACTIVE to DRAFT for new properties
ALTER TABLE "properties" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"PropertyStatus";
