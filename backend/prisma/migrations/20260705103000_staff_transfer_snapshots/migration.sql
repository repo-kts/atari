ALTER TABLE "kvk_fld_introduction" ADD COLUMN IF NOT EXISTS "staff_name" TEXT;
ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "staff_name" TEXT;
ALTER TABLE "kvk_extension_activity" ADD COLUMN IF NOT EXISTS "staff_name" TEXT;
ALTER TABLE "kvk_other_extension_activity" ADD COLUMN IF NOT EXISTS "staff_name" TEXT;
ALTER TABLE "hrd_program" ADD COLUMN IF NOT EXISTS "staff_name" TEXT;

UPDATE "kvk_fld_introduction" AS target
SET "staff_name" = staff."staff_name"
FROM "kvk_staff" AS staff
WHERE target."kvkStaffId" = staff."kvk_staff_id"
  AND (target."staff_name" IS NULL OR target."staff_name" = '');

UPDATE "kvk_oft" AS target
SET "staff_name" = staff."staff_name"
FROM "kvk_staff" AS staff
WHERE target."staffId" = staff."kvk_staff_id"
  AND (target."staff_name" IS NULL OR target."staff_name" = '');

UPDATE "kvk_extension_activity" AS target
SET "staff_name" = staff."staff_name"
FROM "kvk_staff" AS staff
WHERE target."staffId" = staff."kvk_staff_id"
  AND (target."staff_name" IS NULL OR target."staff_name" = '');

UPDATE "kvk_other_extension_activity" AS target
SET "staff_name" = staff."staff_name"
FROM "kvk_staff" AS staff
WHERE target."staffId" = staff."kvk_staff_id"
  AND (target."staff_name" IS NULL OR target."staff_name" = '');

UPDATE "hrd_program" AS target
SET "staff_name" = staff."staff_name"
FROM "kvk_staff" AS staff
WHERE target."kvkStaffId" = staff."kvk_staff_id"
  AND (target."staff_name" IS NULL OR target."staff_name" = '');

UPDATE "kvk_staff"
SET "transfer_status" = 'ACTIVE'
WHERE "transfer_status" = 'TRANSFERRED';
