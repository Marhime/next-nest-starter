-- Migration SQL to add construction_year and land_surface to properties table
-- Run this either via psql or by creating a proper Prisma migration.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS construction_year integer;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS land_surface numeric(8,2);
