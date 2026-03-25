CREATE TABLE IF NOT EXISTS "user_login_activity" (
  "log_id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "kvk_id" INTEGER,
  "user_name" TEXT,
  "user_email" TEXT,
  "role_name" TEXT,
  "zone_id" INTEGER,
  "state_id" INTEGER,
  "district_id" INTEGER,
  "org_id" INTEGER,
  "kvk_name" TEXT,
  "activity" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "event_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "user_login_activity_event_at_idx"
  ON "user_login_activity"("event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_kvk_id_event_at_idx"
  ON "user_login_activity"("kvk_id", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_user_id_event_at_idx"
  ON "user_login_activity"("user_id", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_activity_event_at_idx"
  ON "user_login_activity"("activity", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_zone_id_event_at_idx"
  ON "user_login_activity"("zone_id", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_state_id_event_at_idx"
  ON "user_login_activity"("state_id", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_district_id_event_at_idx"
  ON "user_login_activity"("district_id", "event_at");

CREATE INDEX IF NOT EXISTS "user_login_activity_org_id_event_at_idx"
  ON "user_login_activity"("org_id", "event_at");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_login_activity_user_id_fkey'
  ) THEN
    ALTER TABLE "user_login_activity"
      ADD CONSTRAINT "user_login_activity_user_id_fkey"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("user_id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'kvk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_login_activity_kvk_id_fkey'
  ) THEN
    ALTER TABLE "user_login_activity"
      ADD CONSTRAINT "user_login_activity_kvk_id_fkey"
      FOREIGN KEY ("kvk_id")
      REFERENCES "kvk"("kvk_id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
