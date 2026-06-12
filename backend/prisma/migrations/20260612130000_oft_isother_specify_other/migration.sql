-- "Other" option support for the OFT Subject -> Thematic Area chain.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the OFT record when that option is selected.
-- Mirrors 20260612120000_fld_isother_specify_other.

ALTER TABLE "oft_subject" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "oft_thematic_area" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_oft" ADD COLUMN "oft_subject_other" TEXT;
ALTER TABLE "kvk_oft" ADD COLUMN "oft_thematic_area_other" TEXT;
