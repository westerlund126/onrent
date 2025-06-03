/*
  Warnings:

  - You are about to drop the `RescheduleRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RescheduleRequest" DROP CONSTRAINT "RescheduleRequest_fittingId_fkey";

-- DropForeignKey
ALTER TABLE "RescheduleRequest" DROP CONSTRAINT "RescheduleRequest_userId_fkey";

-- DropTable
DROP TABLE "RescheduleRequest";

-- DropEnum
DROP TYPE "RescheduleStatus";
