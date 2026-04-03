CREATE TABLE IF NOT EXISTS "module_images" (
  "image_id" SERIAL PRIMARY KEY,
  "kvk_id" INTEGER NOT NULL,
  "zone_id" INTEGER,
  "state_id" INTEGER,
  "district_id" INTEGER,
  "org_id" INTEGER,
  "module_id" INTEGER NOT NULL,
  "caption" TEXT,
  "image_date" TIMESTAMP(3) NOT NULL,
  "reporting_year" INTEGER NOT NULL,
  "image_data" BYTEA NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_name" TEXT,
  "uploaded_by_user_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "module_images_kvk_id_image_date_idx"
  ON "module_images"("kvk_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_reporting_year_image_date_idx"
  ON "module_images"("reporting_year", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_module_id_image_date_idx"
  ON "module_images"("module_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_zone_id_image_date_idx"
  ON "module_images"("zone_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_state_id_image_date_idx"
  ON "module_images"("state_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_district_id_image_date_idx"
  ON "module_images"("district_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_org_id_image_date_idx"
  ON "module_images"("org_id", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_uploaded_by_user_id_image_date_idx"
  ON "module_images"("uploaded_by_user_id", "image_date");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'module_images_kvk_id_fkey'
  ) THEN
    ALTER TABLE "module_images"
      ADD CONSTRAINT "module_images_kvk_id_fkey"
      FOREIGN KEY ("kvk_id")
      REFERENCES "kvk"("kvk_id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'modules'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'module_images_module_id_fkey'
  ) THEN
    ALTER TABLE "module_images"
      ADD CONSTRAINT "module_images_module_id_fkey"
      FOREIGN KEY ("module_id")
      REFERENCES "modules"("module_id")
      ON DELETE RESTRICT
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
    WHERE constraint_name = 'module_images_uploaded_by_user_id_fkey'
  ) THEN
    ALTER TABLE "module_images"
      ADD CONSTRAINT "module_images_uploaded_by_user_id_fkey"
      FOREIGN KEY ("uploaded_by_user_id")
      REFERENCES "users"("user_id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
