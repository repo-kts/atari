-- AlterTable
ALTER TABLE "kvk_fld_introduction" ADD COLUMN     "unit_id" INTEGER,
ALTER COLUMN "start_date" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_unit_id_idx" ON "kvk_fld_introduction"("unit_id");

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE SET NULL ON UPDATE CASCADE;
