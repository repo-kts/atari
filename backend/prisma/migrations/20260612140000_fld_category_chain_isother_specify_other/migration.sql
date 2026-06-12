-- "Other" option support for the FLD Category -> Sub Category -> Crop chain.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the FLD introduction record when that option is
-- selected. Mirrors 20260612120000_fld_isother_specify_other.

ALTER TABLE "category" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sub_category" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "crop" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_fld_introduction" ADD COLUMN "category_other" TEXT;
ALTER TABLE "kvk_fld_introduction" ADD COLUMN "sub_category_other" TEXT;
ALTER TABLE "kvk_fld_introduction" ADD COLUMN "crop_other" TEXT;
