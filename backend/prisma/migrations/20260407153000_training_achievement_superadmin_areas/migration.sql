-- training_achievement.trainingAreaId -> training_area
-- training_achievement.thematicAreaId -> training_thematic_area.training_thematic_area_id

DO $$
BEGIN
  IF to_regclass('public.training_area_master') IS NOT NULL THEN
    INSERT INTO "training_area" ("training_area_id", "training_area_name", "training_type_id", "created_at", "updated_at")
    SELECT m."training_area_id", m."name", (SELECT "training_type_id" FROM "training_type" ORDER BY "training_type_id" LIMIT 1), m."created_at", m."updated_at"
    FROM "training_area_master" m
    WHERE NOT EXISTS (SELECT 1 FROM "training_area" t WHERE t."training_area_id" = m."training_area_id");
  END IF;
END $$;

SELECT setval(
  pg_get_serial_sequence('"training_area"', 'training_area_id'),
  COALESCE((SELECT MAX("training_area_id") FROM "training_area"), 1)
);

DO $$
BEGIN
  IF to_regclass('public.thematic_area_master') IS NOT NULL THEN
    INSERT INTO "training_thematic_area" ("training_thematic_area_id", "training_thematic_area_name", "training_area_id", "created_at", "updated_at")
    SELECT m."thematic_area_id", m."name", (SELECT "training_area_id" FROM "training_area" ORDER BY "training_area_id" LIMIT 1), m."created_at", m."updated_at"
    FROM "thematic_area_master" m
    WHERE NOT EXISTS (SELECT 1 FROM "training_thematic_area" t WHERE t."training_thematic_area_id" = m."thematic_area_id");
  END IF;
END $$;

SELECT setval(
  pg_get_serial_sequence('"training_thematic_area"', 'training_thematic_area_id'),
  COALESCE((SELECT MAX("training_thematic_area_id") FROM "training_thematic_area"), 1)
);

ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_trainingAreaId_fkey";
ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_training_area_id_fkey";
ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_thematicAreaId_fkey";
ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_thematic_area_id_fkey";

ALTER TABLE "training_achievement"
  ADD CONSTRAINT "training_achievement_trainingAreaId_fkey"
  FOREIGN KEY ("trainingAreaId") REFERENCES "training_area"("training_area_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "training_achievement"
  ADD CONSTRAINT "training_achievement_thematicAreaId_fkey"
  FOREIGN KEY ("thematicAreaId") REFERENCES "training_thematic_area"("training_thematic_area_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE IF EXISTS "training_area_master";
DROP TABLE IF EXISTS "thematic_area_master";
