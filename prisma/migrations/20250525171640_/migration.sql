/*
  Warnings:

  - The values [ORDER_RECEIVED] on the enum `TrackingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TrackingStatus_new" AS ENUM ('RENTAL_ONGOING', 'RETURN_PENDING', 'RETURNED', 'COMPLETED');
ALTER TABLE "Tracking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tracking" ALTER COLUMN "status" TYPE "TrackingStatus_new" USING ("status"::text::"TrackingStatus_new");
ALTER TYPE "TrackingStatus" RENAME TO "TrackingStatus_old";
ALTER TYPE "TrackingStatus_new" RENAME TO "TrackingStatus";
DROP TYPE "TrackingStatus_old";
ALTER TABLE "Tracking" ALTER COLUMN "status" SET DEFAULT 'RENTAL_ONGOING';
COMMIT;

-- AlterTable
ALTER TABLE "Tracking" ALTER COLUMN "status" SET DEFAULT 'RENTAL_ONGOING';
