-- DropIndex
DROP INDEX "Review_rentalId_key";

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "hasReview" BOOLEAN NOT NULL DEFAULT false;
