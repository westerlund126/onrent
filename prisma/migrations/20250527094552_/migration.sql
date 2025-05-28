-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "additionalInfo" TEXT;

-- CreateTable
CREATE TABLE "RentalItem" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "variantProductId" INTEGER NOT NULL,

    CONSTRAINT "RentalItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_variantProductId_fkey" FOREIGN KEY ("variantProductId") REFERENCES "VariantProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
