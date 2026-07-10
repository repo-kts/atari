-- Indexes backing the detailed dashboard analytics aggregates.
--
-- `training_achievement` had no indexes at all, so every grouped count was a
-- sequential scan. The other three cover the (kvk_id, <date>) and
-- (kvk_id, <status>, <date>) access patterns the analytics query joins on.
--
-- IF NOT EXISTS keeps this safe to re-run against DBs already synced via
-- `prisma db push`.

CREATE INDEX IF NOT EXISTS "training_achievement_kvkId_idx"
    ON "training_achievement" ("kvkId");

CREATE INDEX IF NOT EXISTS "training_achievement_kvkId_start_date_idx"
    ON "training_achievement" ("kvkId", "start_date");

CREATE INDEX IF NOT EXISTS "kvk_extension_activity_kvkId_start_date_idx"
    ON "kvk_extension_activity" ("kvkId", "start_date");

CREATE INDEX IF NOT EXISTS "kvk_oft_kvkId_ongoing_completed_expected_completion_date_idx"
    ON "kvk_oft" ("kvkId", "ongoing_completed", "expected_completion_date");

-- Name truncated to 63 chars by Prisma; must match exactly or the schema reads as drifted.
CREATE INDEX IF NOT EXISTS "kvk_fld_introduction_kvkId_ongoing_completed_expected_compl_idx"
    ON "kvk_fld_introduction" ("kvkId", "ongoing_completed", "expected_completion_date");
