-- The Priority Thrust form and Prisma model save these fields, but the baseline
-- table was created without them. Defaults preserve any existing rows.
ALTER TABLE "priority_thrust_area"
  ADD COLUMN IF NOT EXISTS "major_focus" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "achievement" TEXT NOT NULL DEFAULT '';
