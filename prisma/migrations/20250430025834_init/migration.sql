/*
  Warnings:

  - You are about to drop the column `name` on the `VariantProducts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[size,color,productsId]` on the table `VariantProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
-- DROP INDEX "VariantProducts_name_size_color_productsId_key";

-- AlterTable
-- ALTER TABLE "VariantProducts" DROP COLUMN "name";

-- -- CreateIndex
-- CREATE UNIQUE INDEX "VariantProducts_size_color_productsId_key" ON "VariantProducts"("size", "color", "productsId");
