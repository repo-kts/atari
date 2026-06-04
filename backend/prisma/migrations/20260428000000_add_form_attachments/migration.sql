-- Generic form attachment storage backed by S3.
-- Used by OFT (photographs, supplementary datasheets) and other forms going forward.
-- Legacy single-file columns on existing tables (e.g. oft_result_report.photograph_*)
-- remain in place for backfill — new uploads write to form_attachments.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FormAttachmentKind') THEN
        CREATE TYPE "FormAttachmentKind" AS ENUM ('PHOTO', 'DATASHEET', 'DOCUMENT');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS "form_attachments" (
    "attachment_id"        SERIAL PRIMARY KEY,
    "kvk_id"               INTEGER NOT NULL,
    "form_code"            TEXT NOT NULL,
    "record_id"            INTEGER,
    "kind"                 "FormAttachmentKind" NOT NULL DEFAULT 'PHOTO',
    "s3_key"               TEXT NOT NULL,
    "file_name"            TEXT,
    "mime_type"            TEXT NOT NULL,
    "size"                 INTEGER NOT NULL DEFAULT 0,
    "caption"              TEXT,
    "sort_order"           INTEGER NOT NULL DEFAULT 0,
    "reporting_year_date"  TIMESTAMP(3),
    "uploaded_by_user_id"  INTEGER,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "form_attachments_kvk_id_fkey"
        FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE,
    CONSTRAINT "form_attachments_uploaded_by_user_id_fkey"
        FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "form_attachments_kvk_form_record_idx"
    ON "form_attachments" ("kvk_id", "form_code", "record_id");
CREATE INDEX IF NOT EXISTS "form_attachments_form_record_idx"
    ON "form_attachments" ("form_code", "record_id");
CREATE INDEX IF NOT EXISTS "form_attachments_kvk_form_kind_created_idx"
    ON "form_attachments" ("kvk_id", "form_code", "kind", "created_at");
CREATE INDEX IF NOT EXISTS "form_attachments_reporting_year_date_idx"
    ON "form_attachments" ("reporting_year_date");
CREATE INDEX IF NOT EXISTS "form_attachments_uploaded_by_idx"
    ON "form_attachments" ("uploaded_by_user_id");
