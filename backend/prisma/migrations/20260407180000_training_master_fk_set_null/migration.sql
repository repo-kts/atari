-- training_area / training_thematic_area: parent delete should null the FK (SetNull), not cascade children.
-- Supports both Prisma default column names (camelCase) and legacy snake_case.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_area' AND column_name = 'trainingTypeId'
  ) THEN
    ALTER TABLE "training_area" DROP CONSTRAINT IF EXISTS "training_area_trainingTypeId_fkey";
    ALTER TABLE "training_area" ADD CONSTRAINT "training_area_trainingTypeId_fkey"
      FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("training_type_id") ON DELETE SET NULL ON UPDATE CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_area' AND column_name = 'training_type_id'
  ) THEN
    ALTER TABLE "training_area" DROP CONSTRAINT IF EXISTS "training_area_training_type_id_fkey";
    ALTER TABLE "training_area" ADD CONSTRAINT "training_area_training_type_id_fkey"
      FOREIGN KEY ("training_type_id") REFERENCES "training_type"("training_type_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_thematic_area' AND column_name = 'trainingAreaId'
  ) THEN
    ALTER TABLE "training_thematic_area" DROP CONSTRAINT IF EXISTS "training_thematic_area_trainingAreaId_fkey";
    ALTER TABLE "training_thematic_area" ADD CONSTRAINT "training_thematic_area_trainingAreaId_fkey"
      FOREIGN KEY ("trainingAreaId") REFERENCES "training_area"("training_area_id") ON DELETE SET NULL ON UPDATE CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'training_thematic_area' AND column_name = 'training_area_id'
  ) THEN
    ALTER TABLE "training_thematic_area" DROP CONSTRAINT IF EXISTS "training_thematic_area_training_area_id_fkey";
    ALTER TABLE "training_thematic_area" ADD CONSTRAINT "training_thematic_area_training_area_id_fkey"
      FOREIGN KEY ("training_area_id") REFERENCES "training_area"("training_area_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
