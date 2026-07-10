-- Decouple Institute (orgMaster) and Host (universityMaster) from the
-- geographic cascade. They were previously created once per district/org
-- respectively (via the KVK/Institute/Host cascading dropdowns), which
-- produced many duplicate rows sharing the same name — e.g. "SAU" existed
-- as 43 separate orgMaster rows, "BAU Sabour" as 22 separate
-- universityMaster rows. This migration collapses each duplicate-name
-- group down to one canonical row (the lowest id in the group), repoints
-- every foreign key that referenced a duplicate at the canonical row, then
-- deletes the now-unreferenced duplicates. Every UPDATE is guarded by
-- "<> canonical_id" so this is safe to re-run (a second run is a no-op).

-- ============================================================
-- 1. Repoint kvk.org_id at the canonical orgMaster row for its name
-- ============================================================
UPDATE "kvk" k
SET "org_id" = c."canonical_id"
FROM "orgMaster" o
JOIN (
  SELECT "org_name", MIN("org_id") AS canonical_id
  FROM "orgMaster"
  GROUP BY "org_name"
) c ON c."org_name" = o."org_name"
WHERE k."org_id" = o."org_id"
  AND k."org_id" <> c."canonical_id";

-- ============================================================
-- 2. Repoint kvk.university_id at the canonical universityMaster row
-- ============================================================
UPDATE "kvk" k
SET "university_id" = c."canonical_id"
FROM "universityMaster" u
JOIN (
  SELECT "university_name", MIN("university_id") AS canonical_id
  FROM "universityMaster"
  GROUP BY "university_name"
) c ON c."university_name" = u."university_name"
WHERE k."university_id" = u."university_id"
  AND k."university_id" <> c."canonical_id";

-- ============================================================
-- 3. Repoint users.org_id at the canonical orgMaster row
-- ============================================================
UPDATE "users" us
SET "org_id" = c."canonical_id"
FROM "orgMaster" o
JOIN (
  SELECT "org_name", MIN("org_id") AS canonical_id
  FROM "orgMaster"
  GROUP BY "org_name"
) c ON c."org_name" = o."org_name"
WHERE us."org_id" = o."org_id"
  AND us."org_id" <> c."canonical_id";

-- ============================================================
-- 4. Repoint users.university_id at the canonical universityMaster row
-- ============================================================
UPDATE "users" us
SET "university_id" = c."canonical_id"
FROM "universityMaster" u
JOIN (
  SELECT "university_name", MIN("university_id") AS canonical_id
  FROM "universityMaster"
  GROUP BY "university_name"
) c ON c."university_name" = u."university_name"
WHERE us."university_id" = u."university_id"
  AND us."university_id" <> c."canonical_id";

-- ============================================================
-- 5. Repoint universityMaster.org_id at the canonical orgMaster row
--    (Host rows that pointed at a soon-to-be-deleted duplicate Institute)
-- ============================================================
UPDATE "universityMaster" uu
SET "org_id" = c."canonical_id"
FROM "orgMaster" o
JOIN (
  SELECT "org_name", MIN("org_id") AS canonical_id
  FROM "orgMaster"
  GROUP BY "org_name"
) c ON c."org_name" = o."org_name"
WHERE uu."org_id" = o."org_id"
  AND uu."org_id" <> c."canonical_id";

-- ============================================================
-- 6. Delete the now-unreferenced duplicate orgMaster rows
--    (safe: every kvk/users/universityMaster row that referenced a
--    duplicate has already been repointed to the canonical row above)
-- ============================================================
DELETE FROM "orgMaster" o
WHERE o."org_id" <> (
  SELECT MIN(o2."org_id") FROM "orgMaster" o2 WHERE o2."org_name" = o."org_name"
);

-- ============================================================
-- 7. Delete the now-unreferenced duplicate universityMaster rows
-- ============================================================
DELETE FROM "universityMaster" u
WHERE u."university_id" <> (
  SELECT MIN(u2."university_id") FROM "universityMaster" u2 WHERE u2."university_name" = u."university_name"
);

-- ============================================================
-- 8. Enforce the dedup going forward: one row per Institute/Host name
-- ============================================================
CREATE UNIQUE INDEX "orgMaster_org_name_key" ON "orgMaster"("org_name");
CREATE UNIQUE INDEX "universityMaster_university_name_key" ON "universityMaster"("university_name");
