-- "Other" option support for the FLD Sector -> Thematic Area chain.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the FLD introduction record when that option is
-- selected. Mirrors 20260611130000_add_isother_specify_other (bank/job types).

ALTER TABLE "sector" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "thematic_area" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_fld_introduction" ADD COLUMN "sector_other" TEXT;
ALTER TABLE "kvk_fld_introduction" ADD COLUMN "thematic_area_other" TEXT;
