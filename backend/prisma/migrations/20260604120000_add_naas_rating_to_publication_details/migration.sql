-- Add optional NAAS rating (decimal) to KVK publication details.
ALTER TABLE "kvk_publication_details" ADD COLUMN IF NOT EXISTS "naas_rating" DOUBLE PRECISION;
