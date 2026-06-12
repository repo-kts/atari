-- "Other" option support for the remaining All-Masters dropdowns:
-- About-KVK (employee/infrastructure/equipment/vehicle) + Important Day + Funding Agency.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the form record when that option is selected.
-- Infrastructure (specify_name) and Funding Agency (specify_agency_name) already
-- have free-text columns, so only the master flag is added for those.

-- Master flags
ALTER TABLE "sanctioned_post" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pay_scale_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pay_level_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "staff_category_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "kvk_infrastructure_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "equipment_type_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "asset_funding_source_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "important_day" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "funding_agency" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

-- Form record "Other" free-text columns
ALTER TABLE "kvk_staff" ADD COLUMN "sanctioned_post_other" TEXT;
ALTER TABLE "kvk_staff" ADD COLUMN "pay_scale_other" TEXT;
ALTER TABLE "kvk_staff" ADD COLUMN "staff_category_other" TEXT;
ALTER TABLE "kvk_staff" ADD COLUMN "pay_level_other" TEXT;
ALTER TABLE "kvk_equipment" ADD COLUMN "equipment_type_other" TEXT;
ALTER TABLE "kvk_equipment" ADD COLUMN "asset_funding_source_other" TEXT;
ALTER TABLE "kvk_important_day_celebration" ADD COLUMN "important_day_other" TEXT;
