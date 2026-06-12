-- "Other" option support for Extension-Outreach masters:
-- ExtensionActivity (achievement extension) + OtherExtensionActivity (other extension).
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the form record when that option is selected.

ALTER TABLE "extension_activity" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "other_extension_activity" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_extension_activity" ADD COLUMN "activity_other" TEXT;
ALTER TABLE "kvk_other_extension_activity" ADD COLUMN "activity_type_other" TEXT;
