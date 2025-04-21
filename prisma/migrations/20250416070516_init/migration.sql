/*
  Warnings:

  - The `status` column on the `FittingSchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `clothesId` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `clothesId` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clothes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productsId` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productsId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FittingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELED', 'RESCHEDULED');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_clothesId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_clothesId_fkey";

-- AlterTable
ALTER TABLE "FittingSchedule" DROP COLUMN "status",
ADD COLUMN     "status" "FittingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "clothesId",
ADD COLUMN     "productsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "clothesId",
ADD COLUMN     "productsId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Clothes";

-- DropEnum
DROP TYPE "BookingStatus";

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
