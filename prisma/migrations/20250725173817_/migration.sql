/*
  Warnings:

  - A unique constraint covering the columns `[fittingSlotId,isActive]` on the table `FittingSchedule` will be added. If there are existing duplicate values, this will fail.
  - Made the column `tfProofUrl` on table `FittingSchedule` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "FittingSchedule_fittingSlotId_key";

-- AlterTable
ALTER TABLE "FittingSchedule" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "tfProofUrl" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FittingSchedule_fittingSlotId_isActive_key" ON "FittingSchedule"("fittingSlotId", "isActive");
