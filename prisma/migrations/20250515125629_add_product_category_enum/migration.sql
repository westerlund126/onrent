/*
  Warnings:

  - The `category` column on the `Products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('KEBAYA', 'PAKAIAN_ADAT', 'GAUN', 'BATIK', 'KEMEJA', 'DRESS', 'BLOUSE', 'CELANA', 'ROK', 'LAINNYA');

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "category",
ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'LAINNYA';
