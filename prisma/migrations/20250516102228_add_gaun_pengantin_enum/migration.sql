/*
  Warnings:

  - The values [GAUN,BATIK,KEMEJA,DRESS,BLOUSE,CELANA,ROK] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('KEBAYA', 'PAKAIAN_ADAT', 'GAUN_PENGANTIN', 'JARIK', 'SELOP', 'BESKAP', 'SELENDANG', 'LAINNYA');
ALTER TABLE "Products" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Products" ALTER COLUMN "category" TYPE "ProductCategory_new" USING ("category"::text::"ProductCategory_new");
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "ProductCategory_old";
ALTER TABLE "Products" ALTER COLUMN "category" SET DEFAULT 'LAINNYA';
COMMIT;
