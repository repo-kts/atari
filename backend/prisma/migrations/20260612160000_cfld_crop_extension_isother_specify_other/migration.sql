-- "Other" option support for the CFLD Crop master + CFLD Extension Activity season.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the form record when that option is selected.
-- Mirrors 20260612150000_cfld_season_isother_specify_other.

ALTER TABLE "fld_crop_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "cfl_cfld_technical_parameter" ADD COLUMN "crop_other" TEXT;
ALTER TABLE "extension_activity_organized" ADD COLUMN "season_other" TEXT;
