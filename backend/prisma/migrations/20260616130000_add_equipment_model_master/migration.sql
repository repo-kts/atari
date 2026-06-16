-- Migration-only reverse-lookup table for equipment migration.
-- Holds old-site raw equipment names (Company / Brand / Model), each linked to a
-- curated parent equipment_master row. Not used at KVK runtime.
CREATE TABLE "equipment_model_master" (
    "equipment_model_id" SERIAL NOT NULL,
    "equipment_master_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_model_master_pkey" PRIMARY KEY ("equipment_model_id")
);

CREATE INDEX "equipment_model_master_equipment_master_id_idx" ON "equipment_model_master"("equipment_master_id");

CREATE INDEX "equipment_model_master_name_idx" ON "equipment_model_master"("name");

CREATE UNIQUE INDEX "equipment_model_master_equipment_master_id_name_key" ON "equipment_model_master"("equipment_master_id", "name");

ALTER TABLE "equipment_model_master" ADD CONSTRAINT "equipment_model_master_equipment_master_id_fkey" FOREIGN KEY ("equipment_master_id") REFERENCES "equipment_master"("equipment_master_id") ON DELETE CASCADE ON UPDATE CASCADE;
