-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
