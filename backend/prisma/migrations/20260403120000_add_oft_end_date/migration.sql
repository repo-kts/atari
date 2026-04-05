-- Add optional end date for OFT trials
ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "oft_end_date" TIMESTAMP(3);
