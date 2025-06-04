/*
  Warnings:

  - The values [RESCHEDULED] on the enum `FittingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FittingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELED');
ALTER TABLE "FittingSchedule" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FittingSchedule" ALTER COLUMN "status" TYPE "FittingStatus_new" USING ("status"::text::"FittingStatus_new");
ALTER TYPE "FittingStatus" RENAME TO "FittingStatus_old";
ALTER TYPE "FittingStatus_new" RENAME TO "FittingStatus";
DROP TYPE "FittingStatus_old";
ALTER TABLE "FittingSchedule" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
