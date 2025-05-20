/*
  Warnings:

  - A unique constraint covering the columns `[size,color,bustlength,waistlength,length,productsId,sku]` on the table `VariantProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VariantProducts_size_color_bustlength_waistlength_length_pr_key";

-- CreateIndex
CREATE UNIQUE INDEX "VariantProducts_size_color_bustlength_waistlength_length_pr_key" ON "VariantProducts"("size", "color", "bustlength", "waistlength", "length", "productsId", "sku");
