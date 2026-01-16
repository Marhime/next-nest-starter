/*
  Warnings:

  - You are about to drop the column `available_from` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "available_from",
ADD COLUMN     "phone" INTEGER,
ALTER COLUMN "country" SET DEFAULT 'MX';
