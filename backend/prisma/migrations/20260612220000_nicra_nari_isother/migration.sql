-- "Other" option support for NICRA (category) + NARI (nutrition garden).
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the form record when that option is selected.

-- Master flags
ALTER TABLE "nicra_category" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "nari_activity" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "nutrition_garden_type" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

-- Form record "Other" free-text columns
ALTER TABLE "nicra_details" ADD COLUMN "category_other" TEXT;
ALTER TABLE "nari_nutritional_garden" ADD COLUMN "activity_other" TEXT;
ALTER TABLE "nari_nutritional_garden" ADD COLUMN "type_of_nutritional_garden_other" TEXT;
