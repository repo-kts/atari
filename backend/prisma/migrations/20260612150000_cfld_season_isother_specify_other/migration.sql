-- "Other" option support for the CFLD Season + Crop Type masters.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the CFLD technical-parameter record when that
-- option is selected. Mirrors 20260612120000_fld_isother_specify_other.

ALTER TABLE "season" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "crop_type" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "cfl_cfld_technical_parameter" ADD COLUMN "season_other" TEXT;
ALTER TABLE "cfl_cfld_technical_parameter" ADD COLUMN "type_other" TEXT;
