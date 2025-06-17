/*
  Warnings:

  - The primary key for the `FittingProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "FittingProduct" DROP CONSTRAINT "FittingProduct_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FittingProduct_pkey" PRIMARY KEY ("id");
