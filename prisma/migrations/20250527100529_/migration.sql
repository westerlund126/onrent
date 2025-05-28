/*
  Warnings:

  - You are about to drop the column `productsId` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `variantProductId` on the `Rental` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_productsId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_variantProductId_fkey";

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "productsId",
DROP COLUMN "variantProductId";
