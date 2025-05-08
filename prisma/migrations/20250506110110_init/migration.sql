/*
  Warnings:

  - You are about to drop the column `availstock` on the `VariantProducts` table. All the data in the column will be lost.
  - You are about to drop the column `rentedstock` on the `VariantProducts` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `VariantProducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VariantProducts" DROP COLUMN "availstock",
DROP COLUMN "rentedstock",
DROP COLUMN "stock",
ADD COLUMN     "isRented" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isAvailable" SET DEFAULT true;
