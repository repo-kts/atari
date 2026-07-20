-- BLA-50: manage Demo Unit names through a master and track functional status.
CREATE TABLE "demo_unit_name_master" (
    "demo_unit_name_id" SERIAL NOT NULL,
    "demo_unit_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "demo_unit_name_master_pkey" PRIMARY KEY ("demo_unit_name_id")
);

CREATE UNIQUE INDEX "demo_unit_name_master_demo_unit_name_key"
ON "demo_unit_name_master"("demo_unit_name");

-- Preserve every name that is already used by a KVK so existing records remain
-- editable immediately after the form changes from free text to a dropdown.
INSERT INTO "demo_unit_name_master" ("demo_unit_name")
SELECT DISTINCT BTRIM("demo_unit_name")
FROM "demonstration_unit"
WHERE "demo_unit_name" IS NOT NULL AND BTRIM("demo_unit_name") <> ''
ON CONFLICT ("demo_unit_name") DO NOTHING;

ALTER TABLE "demonstration_unit"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Functional';

-- Retired BLA-50 fields are kept nullable for non-destructive historical-data
-- compatibility. They are no longer accepted or rendered by the application.
ALTER TABLE "demonstration_unit"
ALTER COLUMN "variety_breed" DROP NOT NULL,
ALTER COLUMN "produce" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "cost_of_inputs" DROP NOT NULL,
ALTER COLUMN "gross_income" DROP NOT NULL,
ALTER COLUMN "remarks" DROP NOT NULL;

-- Register the master in access control and mirror the existing Programme Type
-- master permissions so the same administrator roles can manage it.
INSERT INTO "modules" (
    "menu_name", "sub_menu_name", "module_code", "sort_order", "updated_at"
)
VALUES (
    'All Masters', 'Name of Demo Unit Master',
    'all_masters_demo_unit_name_master', 122, CURRENT_TIMESTAMP
)
ON CONFLICT ("module_code") DO UPDATE SET
    "menu_name" = EXCLUDED."menu_name",
    "sub_menu_name" = EXCLUDED."sub_menu_name",
    "sort_order" = EXCLUDED."sort_order",
    "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "permissions" ("module_id", "action", "updated_at")
SELECT m."module_id", a.action::"PermissionAction", CURRENT_TIMESTAMP
FROM "modules" m
CROSS JOIN (VALUES ('VIEW'), ('ADD'), ('EDIT'), ('DELETE')) AS a(action)
WHERE m."module_code" = 'all_masters_demo_unit_name_master'
  AND NOT EXISTS (
      SELECT 1 FROM "permissions" p
      WHERE p."module_id" = m."module_id"
        AND p."action" = a.action::"PermissionAction"
  );

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT rp."role_id", new_permission."permission_id"
FROM "role_permissions" rp
JOIN "permissions" old_permission
  ON old_permission."permission_id" = rp."permission_id"
JOIN "modules" old_module
  ON old_module."module_id" = old_permission."module_id"
 AND old_module."module_code" = 'all_masters_programme_type_master'
JOIN "modules" new_module
  ON new_module."module_code" = 'all_masters_demo_unit_name_master'
JOIN "permissions" new_permission
  ON new_permission."module_id" = new_module."module_id"
 AND new_permission."action" = old_permission."action"
ON CONFLICT DO NOTHING;

INSERT INTO "user_permissions" ("user_id", "permission_id")
SELECT up."user_id", new_permission."permission_id"
FROM "user_permissions" up
JOIN "permissions" old_permission
  ON old_permission."permission_id" = up."permission_id"
JOIN "modules" old_module
  ON old_module."module_id" = old_permission."module_id"
 AND old_module."module_code" = 'all_masters_programme_type_master'
JOIN "modules" new_module
  ON new_module."module_code" = 'all_masters_demo_unit_name_master'
JOIN "permissions" new_permission
  ON new_permission."module_id" = new_module."module_id"
 AND new_permission."action" = old_permission."action"
ON CONFLICT DO NOTHING;
