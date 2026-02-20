-- AlterTable: add optional hierarchy_level column to roles
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "hierarchy_level" INTEGER;
