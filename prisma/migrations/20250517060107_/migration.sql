/*
  Warnings:

  - A unique constraint covering the columns `[rentalCode]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rentalCode` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "rentalCode" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rental_rentalCode_key" ON "Rental"("rentalCode");
