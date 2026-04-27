-- Widen form_attachments.record_id from INTEGER to TEXT so UUID-keyed forms
-- (FarmerAward, SuccessStory, etc.) can attach via the same table.

ALTER TABLE "form_attachments"
    ALTER COLUMN "record_id" TYPE TEXT
    USING ("record_id"::text);
