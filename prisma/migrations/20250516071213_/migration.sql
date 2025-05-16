/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `VariantProducts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `VariantProducts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('KEBAYA', 'PAKAIAN_ADAT', 'GAUN_PENGANTIN', 'JARIK', 'SELOP', 'BESKAP', 'SELENDANG', 'LAINNYA');

-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('BELUM_LUNAS', 'LUNAS', 'TERLAMBAT', 'SELESAI');
ALTER TABLE "Rental" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rental" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "RentalStatus_old";
ALTER TABLE "Rental" ALTER COLUMN "status" SET DEFAULT 'BELUM_LUNAS';
COMMIT;

-- AlterTable
ALTER TABLE "Rental" ALTER COLUMN "status" SET DEFAULT 'BELUM_LUNAS';

-- AlterTable
ALTER TABLE "VariantProducts" ADD COLUMN     "sku" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VariantProducts_sku_key" ON "VariantProducts"("sku");
