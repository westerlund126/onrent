/*
  Warnings:

  - You are about to drop the column `color` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Products` table. All the data in the column will be lost.
  - Added the required column `description` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantProductId` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "color",
DROP COLUMN "price",
DROP COLUMN "size",
DROP COLUMN "stock",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "variantProductId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "VariantProducts" (
    "id" SERIAL NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "availstock" INTEGER NOT NULL,
    "rentedstock" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productsId" INTEGER NOT NULL,
    "bustlength" DOUBLE PRECISION,
    "waistlength" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,

    CONSTRAINT "VariantProducts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VariantProducts_size_color_bustlength_waistlength_length_pr_key" ON "VariantProducts"("size", "color", "bustlength", "waistlength", "length", "productsId");

-- AddForeignKey
ALTER TABLE "VariantProducts" ADD CONSTRAINT "VariantProducts_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_variantProductId_fkey" FOREIGN KEY ("variantProductId") REFERENCES "VariantProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
