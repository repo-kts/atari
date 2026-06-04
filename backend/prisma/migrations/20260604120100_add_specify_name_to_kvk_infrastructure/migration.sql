-- Add optional "specify" text for KVK infrastructure when type is "Others".
ALTER TABLE "kvk_infrastructure" ADD COLUMN IF NOT EXISTS "specify_name" TEXT;
