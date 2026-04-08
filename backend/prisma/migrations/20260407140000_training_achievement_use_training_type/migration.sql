-- Point training_achievement.training_type_id at superadmin training_type (not training_type_master).
-- Copy any master rows into training_type so existing FK values stay valid, then drop the old table.

-- 1) Bring rows from training_type_master into training_type when the id is missing there
INSERT INTO "training_type" ("training_type_id", "training_type_name", "created_at", "updated_at")
SELECT m."training_type_id", m."name", m."created_at", m."updated_at"
FROM "training_type_master" m
WHERE NOT EXISTS (
  SELECT 1 FROM "training_type" t WHERE t."training_type_id" = m."training_type_id"
);

-- Keep serial in sync when explicit ids were inserted
SELECT setval(
  pg_get_serial_sequence('"training_type"', 'training_type_id'),
  COALESCE((SELECT MAX("training_type_id") FROM "training_type"), 1)
);

-- 2) Drop old FK from training_achievement -> training_type_master
ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_trainingTypeId_fkey";
ALTER TABLE "training_achievement" DROP CONSTRAINT IF EXISTS "training_achievement_training_type_id_fkey";

-- 3) New FK to training_type (achievement column is camelCase trainingTypeId in Prisma)
ALTER TABLE "training_achievement"
  ADD CONSTRAINT "training_achievement_trainingTypeId_fkey"
  FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("training_type_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4) Remove obsolete master table
DROP TABLE IF EXISTS "training_type_master";
