-- AlterTable: add optional hierarchy_level column to roles (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "hierarchy_level" INTEGER;
  END IF;
END $$;
