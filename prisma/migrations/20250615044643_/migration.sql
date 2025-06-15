/*
  Warnings:

  - The primary key for the `FittingProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `FittingProduct` table. All the data in the column will be lost.
  - Added the required column `variantProductId` to the `FittingProduct` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dayOfWeek` on the `WeeklySlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `WeeklySlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `WeeklySlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- DropForeignKey
ALTER TABLE "FittingProduct" DROP CONSTRAINT "FittingProduct_productId_fkey";

-- AlterTable
ALTER TABLE "FittingProduct" DROP CONSTRAINT "FittingProduct_pkey",
DROP COLUMN "productId",
ADD COLUMN     "variantProductId" INTEGER NOT NULL,
ADD CONSTRAINT "FittingProduct_pkey" PRIMARY KEY ("fittingId", "variantProductId");

-- AlterTable
ALTER TABLE "WeeklySlot" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIME NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIME NOT NULL;

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- CreateIndex
CREATE INDEX "Rental_startDate_idx" ON "Rental"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySlot_ownerId_dayOfWeek_key" ON "WeeklySlot"("ownerId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "FittingProduct" ADD CONSTRAINT "FittingProduct_variantProductId_fkey" FOREIGN KEY ("variantProductId") REFERENCES "VariantProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
