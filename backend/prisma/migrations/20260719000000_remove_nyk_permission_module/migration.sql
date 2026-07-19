-- Remove the retired Nehru Yuva Kendra form from access-control metadata.
-- Historical NYK form records are intentionally retained.
DELETE FROM "role_permissions"
WHERE "permission_id" IN (
  SELECT "permission_id"
  FROM "permissions"
  WHERE "module_id" IN (
    SELECT "module_id"
    FROM "modules"
    WHERE "module_code" = 'misc_nyk_training'
  )
);

DELETE FROM "user_permissions"
WHERE "permission_id" IN (
  SELECT "permission_id"
  FROM "permissions"
  WHERE "module_id" IN (
    SELECT "module_id"
    FROM "modules"
    WHERE "module_code" = 'misc_nyk_training'
  )
);

DELETE FROM "permissions"
WHERE "module_id" IN (
  SELECT "module_id"
  FROM "modules"
  WHERE "module_code" = 'misc_nyk_training'
);

DELETE FROM "module_images"
WHERE "module_id" IN (
  SELECT "module_id"
  FROM "modules"
  WHERE "module_code" = 'misc_nyk_training'
);

DELETE FROM "modules"
WHERE "module_code" = 'misc_nyk_training';
