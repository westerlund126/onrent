/*
  Warnings:

  - Added the required column `ownerId` to the `FittingProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `FittingSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `VariantProducts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FittingProduct" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FittingSchedule" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessBio" TEXT;

-- AlterTable
ALTER TABLE "VariantProducts" ADD COLUMN     "category" "ProductCategory" NOT NULL;

-- AddForeignKey
ALTER TABLE "FittingSchedule" ADD CONSTRAINT "FittingSchedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingProduct" ADD CONSTRAINT "FittingProduct_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
