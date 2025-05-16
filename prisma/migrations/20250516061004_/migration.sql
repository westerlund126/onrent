/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
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
