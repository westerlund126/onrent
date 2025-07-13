/*
  Warnings:

  - You are about to drop the column `isAutoConfirm` on the `FittingSlot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FittingSlot" DROP COLUMN "isAutoConfirm";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAutoConfirm" BOOLEAN NOT NULL DEFAULT false;
