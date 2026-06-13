-- CreateTable
CREATE TABLE "unit" (
    "unit_id" SERIAL NOT NULL,
    "unit_name" TEXT NOT NULL,
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_unit_name_key" ON "unit"("unit_name");

-- CreateIndex
CREATE INDEX "unit_unit_name_idx" ON "unit"("unit_name");

-- AlterTable
ALTER TABLE "crop" ADD COLUMN "unit_id" INTEGER,
ADD COLUMN "quantity_data_type" TEXT,
ADD COLUMN "quantity_required" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "crop_unit_id_idx" ON "crop"("unit_id");

-- AddForeignKey
ALTER TABLE "crop" ADD CONSTRAINT "crop_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "product" ADD COLUMN "unit_id" INTEGER,
ADD COLUMN "quantity_data_type" TEXT,
ADD COLUMN "quantity_required" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "product_unit_id_idx" ON "product"("unit_id");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "kvk_fld_introduction" ADD COLUMN "quantity_text" TEXT;

-- AlterTable
ALTER TABLE "kvk_production_supply" ADD COLUMN "quantity_text" TEXT;
