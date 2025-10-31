-- Add DRAFT to PropertyStatus enum
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
