-- "Other" option support for the OFT Discipline + Funding Source masters.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the OFT record when that option is selected.
-- Mirrors 20260612130000_oft_isother_specify_other.

ALTER TABLE "discipline" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "funding_source_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_oft" ADD COLUMN "discipline_other" TEXT;
ALTER TABLE "kvk_oft" ADD COLUMN "source_of_funding_other" TEXT;
