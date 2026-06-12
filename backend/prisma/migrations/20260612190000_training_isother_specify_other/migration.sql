-- "Other" option support for the Training achievement form masters:
-- Training Type, Training Area, Training Thematic Area, Clientele.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the training record when that option is selected.
-- Mirrors 20260612120000_fld_isother_specify_other.

ALTER TABLE "training_type" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "training_area" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "training_thematic_area" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "clientele_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "training_achievement" ADD COLUMN "clientele_other" TEXT;
ALTER TABLE "training_achievement" ADD COLUMN "training_type_other" TEXT;
ALTER TABLE "training_achievement" ADD COLUMN "training_area_other" TEXT;
ALTER TABLE "training_achievement" ADD COLUMN "thematic_area_other" TEXT;
ALTER TABLE "training_achievement" ADD COLUMN "funding_source_other" TEXT;
