/*
  Warnings:

  - You are about to drop the column `date` on the `FittingSchedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fittingSlotId]` on the table `FittingSchedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fittingSlotId` to the `FittingSchedule` table without a default value. This is not possible if the table is not empty.
  - Made the column `size` on table `VariantProducts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `VariantProducts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FittingSchedule" DROP COLUMN "date",
ADD COLUMN     "fittingSlotId" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "VariantProducts" ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL;

-- CreateTable
CREATE TABLE "FittingSlot" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "isAutoConfirm" BOOLEAN NOT NULL DEFAULT false,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FittingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FittingProduct" (
    "fittingId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "FittingProduct_pkey" PRIMARY KEY ("fittingId","productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "FittingSchedule_fittingSlotId_key" ON "FittingSchedule"("fittingSlotId");

-- AddForeignKey
ALTER TABLE "FittingSchedule" ADD CONSTRAINT "FittingSchedule_fittingSlotId_fkey" FOREIGN KEY ("fittingSlotId") REFERENCES "FittingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingSlot" ADD CONSTRAINT "FittingSlot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingProduct" ADD CONSTRAINT "FittingProduct_fittingId_fkey" FOREIGN KEY ("fittingId") REFERENCES "FittingSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingProduct" ADD CONSTRAINT "FittingProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
