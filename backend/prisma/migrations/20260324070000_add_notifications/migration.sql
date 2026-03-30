CREATE TABLE IF NOT EXISTS "notifications" (
  "notification_id" SERIAL PRIMARY KEY,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_by_user_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_notifications" (
  "user_notification_id" SERIAL PRIMARY KEY,
  "notification_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_notifications_notification_id_user_id_key"
  ON "user_notifications"("notification_id", "user_id");

CREATE INDEX IF NOT EXISTS "notifications_created_at_idx"
  ON "notifications"("created_at");

CREATE INDEX IF NOT EXISTS "notifications_created_by_user_id_idx"
  ON "notifications"("created_by_user_id");

CREATE INDEX IF NOT EXISTS "user_notifications_user_id_is_read_created_at_idx"
  ON "user_notifications"("user_id", "is_read", "created_at");

CREATE INDEX IF NOT EXISTS "user_notifications_notification_id_idx"
  ON "user_notifications"("notification_id");

CREATE INDEX IF NOT EXISTS "user_notifications_user_id_idx"
  ON "user_notifications"("user_id");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_created_by_user_id_fkey"
      FOREIGN KEY ("created_by_user_id")
      REFERENCES "users"("user_id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_notifications_notification_id_fkey'
  ) THEN
    ALTER TABLE "user_notifications"
      ADD CONSTRAINT "user_notifications_notification_id_fkey"
      FOREIGN KEY ("notification_id")
      REFERENCES "notifications"("notification_id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_notifications_user_id_fkey'
  ) THEN
    ALTER TABLE "user_notifications"
      ADD CONSTRAINT "user_notifications_user_id_fkey"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("user_id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;
