UPDATE "modules"
SET
  "sub_menu_name" = 'Important Events',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "module_code" = 'achievements_celebration_days';
